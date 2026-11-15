"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
import { prepareOfflineCopy } from "@/features/offline/prepare-copy"
import {
  isTransportFailure,
  saveVault,
  VaultRequestError,
} from "@/features/vault/api"
import {
  decryptEntries,
  encryptEntries,
  prepareVault,
  unlockPasskey,
  unlockPassword,
  unlockRecovery,
  wrapPasskey,
} from "@/features/vault/crypto"
import {
  getRememberedPasskey,
  rememberPasskey,
} from "@/features/vault/passkey-preference"
import {
  authenticatePasskey,
  canUsePasskeys,
  registerPasskey,
} from "@/features/vault/passkeys"
import { useIdleLock } from "@/features/vault/use-idle-lock"
import type { MessageKey } from "@/lib/i18n/messages"
import {
  captureOfflineMarker,
  clearOfflineVault,
  readOfflineVault,
  refreshOfflineVault,
  subscribeToOfflineReset,
} from "@/lib/offline/storage"
import type { EncryptedVault, VaultEntry, VaultRead } from "@/schemas/vault"

type OpenVault = { key: CryptoKey; entries: VaultEntry[] }
type PreparedVault = Awaited<ReturnType<typeof prepareVault>> & {
  entries: VaultEntry[]
  renewOfflineLease: boolean
}

type PasskeyAssertion = Awaited<ReturnType<typeof authenticatePasskey>>
type UnlockInput = { password: string } | { credential: PasskeyAssertion }

export function useVault(offerPasskeyOnEntry = false) {
  const [snapshot, setSnapshot] = useState<VaultRead>()
  const [open, setOpen] = useState<OpenVault>()
  const [prepared, setPrepared] = useState<PreparedVault>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<MessageKey>()
  const epoch = useRef(0)
  const running = useRef(false)
  const passkeyPrompt = useRef<AbortController | null>(null)
  const automaticAttempted = useRef(false)

  const cancelPasskeyPrompt = useCallback(() => {
    passkeyPrompt.current?.abort()
    passkeyPrompt.current = null
  }, [])

  const dismissAutomaticPasskey = useCallback(() => {
    automaticAttempted.current = true
    cancelPasskeyPrompt()
  }, [cancelPasskeyPrompt])

  const lock = useCallback(() => {
    epoch.current++
    dismissAutomaticPasskey()
    setOpen(undefined)
    setPrepared(undefined)
    setError(undefined)
  }, [dismissAutomaticPasskey])

  const offline = useCallback(async () => {
    lock()
    setSnapshot(undefined)
    if (await readOfflineVault().catch(() => undefined)) {
      window.location.replace("/offline-vault")
      return
    }
    setError("vaultOffline")
  }, [lock])

  useEffect(() => {
    const controller = new AbortController()
    loadOnlineSnapshot(
      AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])
    )
      .then((data) => {
        if (!controller.signal.aborted) setSnapshot(data)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (isTransportFailure(error)) {
          void offline()
          return
        }
        setError(
          error instanceof VaultRequestError ? error.code : "loadVaultFailed"
        )
      })
    const onOffline = () => void offline()
    window.addEventListener("offline", onOffline)
    window.addEventListener("pagehide", dismissAutomaticPasskey)
    const stop = subscribeToOfflineReset(lock)
    return () => {
      epoch.current++
      cancelPasskeyPrompt()
      controller.abort()
      window.removeEventListener("offline", onOffline)
      window.removeEventListener("pagehide", dismissAutomaticPasskey)
      stop()
    }
  }, [cancelPasskeyPrompt, dismissAutomaticPasskey, lock, offline])

  useIdleLock(Boolean(open || prepared), lock)

  const run = useCallback(
    async (
      operation: (current: () => boolean) => Promise<void>,
      message: MessageKey = "vaultOperationFailed"
    ) => {
      if (running.current) return false
      running.current = true
      const previous = epoch.current
      const current = () => epoch.current === previous
      setBusy(true)
      setError(undefined)
      try {
        await operation(current)
        return current()
      } catch (error) {
        if (current()) {
          if (isTransportFailure(error) && !navigator.onLine) {
            await offline()
            return false
          }
          if (
            error instanceof VaultRequestError &&
            [401, 403, 409].includes(error.status)
          ) {
            lock()
            setSnapshot(undefined)
          }
          setError(error instanceof VaultRequestError ? error.code : message)
        }
        return false
      } finally {
        running.current = false
        setBusy(false)
      }
    },
    [lock, offline]
  )

  const reload = useCallback(
    () =>
      run(async (current) => {
        const data = await loadOnlineSnapshot()
        if (current()) setSnapshot(data)
      }, "loadVaultFailed"),
    [run]
  )

  const finishUnlock = useCallback(
    async (
      input: UnlockInput,
      current: () => boolean,
      marker: ReturnType<typeof captureOfflineMarker>,
      signal?: AbortSignal
    ) => {
      if (!snapshot?.encrypted || !current() || signal?.aborted) return
      const { ownerId, encrypted } = snapshot
      const latest = await loadOnlineSnapshot(
        signal
          ? AbortSignal.any([signal, AbortSignal.timeout(8000)])
          : undefined
      )
      if (!current() || signal?.aborted) return
      if (latest.ownerId !== ownerId || latest.revision !== snapshot.revision) {
        throw new VaultRequestError(409)
      }

      let key: CryptoKey
      if ("credential" in input) {
        const { id, result } = input.credential
        const passkey = encrypted.passkeys.find((stored) => stored.id === id)
        if (!passkey) throw new Error("Unknown passkey")
        key = await unlockPasskey(ownerId, passkey, result)
      } else {
        key = await unlockPassword(ownerId, input.password, encrypted.password)
      }
      const entries = await decryptEntries(ownerId, key, encrypted.entries)
      if (!current() || signal?.aborted) return
      if ("credential" in input) rememberPasskey(ownerId, input.credential.id)
      setOpen({ key, entries })
      void marker.then((ticket) => prepareOfflineCopy(latest, ticket))
    },
    [snapshot]
  )

  const requestPasskey = useCallback(
    async (
      passkeys: EncryptedVault["passkeys"],
      complete: (
        credential: PasskeyAssertion,
        signal: AbortSignal
      ) => Promise<unknown>
    ) => {
      const controller = new AbortController()
      passkeyPrompt.current = controller
      let credential: PasskeyAssertion | undefined
      try {
        credential = await authenticatePasskey(passkeys, controller.signal)
        if (!controller.signal.aborted)
          await complete(credential, controller.signal)
      } catch (error) {
        if (!controller.signal.aborted) throw error
      } finally {
        if (credential) new Uint8Array(credential.result).fill(0)
        if (passkeyPrompt.current === controller) passkeyPrompt.current = null
      }
    },
    []
  )

  const unlock = useCallback(
    (method: "password" | "passkey", password = "") => {
      if (running.current) return Promise.resolve(false)
      dismissAutomaticPasskey()
      return run(
        async (current) => {
          if (!snapshot?.encrypted) return
          const marker = captureOfflineMarker().catch(() => undefined)
          if (method === "password") {
            await finishUnlock({ password }, current, marker)
            return
          }

          await requestPasskey(
            snapshot.encrypted.passkeys,
            (credential, signal) =>
              finishUnlock({ credential }, current, marker, signal)
          )
        },
        method === "password" ? "unlockPasswordFailed" : "unlockPasskeyFailed"
      )
    },
    [dismissAutomaticPasskey, finishUnlock, requestPasskey, run, snapshot]
  )

  useEffect(() => {
    if (!offerPasskeyOnEntry || !snapshot || automaticAttempted.current) return

    // Defer until after mounting so development effect replay cannot open two prompts.
    const timer = window.setTimeout(() => {
      if (automaticAttempted.current) return
      automaticAttempted.current = true
      if (
        document.visibilityState !== "visible" ||
        !navigator.onLine ||
        !canUsePasskeys()
      )
        return
      const rememberedId = getRememberedPasskey(snapshot.ownerId)
      const passkey = snapshot.encrypted?.passkeys.find(
        ({ id }) => id === rememberedId
      )
      if (!passkey) return

      const marker = captureOfflineMarker().catch(() => undefined)
      void requestPasskey([passkey], (credential, signal) =>
        run(
          (current) => finishUnlock({ credential }, current, marker, signal),
          "unlockPasskeyFailed"
        )
      ).catch(() => {
        // Automatic prompts can be declined or blocked by the browser.
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [finishUnlock, offerPasskeyOnEntry, requestPasskey, run, snapshot])

  const prepare = useCallback(
    (password: string, previous: string, recoveryCode: string) =>
      run(
        async (current) => {
          if (!snapshot) return
          const { ownerId, encrypted } = snapshot
          let entries: VaultEntry[] = []
          if (encrypted) {
            const key = recoveryCode
              ? await unlockRecovery(ownerId, recoveryCode, encrypted.recovery)
              : await unlockPassword(ownerId, previous, encrypted.password)
            entries = await decryptEntries(ownerId, key, encrypted.entries)
          }
          if (!current()) return
          const next = await prepareVault(ownerId, password, entries)
          if (current()) {
            setPrepared({
              ...next,
              entries,
              renewOfflineLease: !encrypted || Boolean(recoveryCode),
            })
          }
        },
        recoveryCode ? "recoverFailed" : "checkMasterPassword"
      ),
    [run, snapshot]
  )

  const persist = useCallback(
    async (encrypted: EncryptedVault) => {
      if (!snapshot) throw new Error("Vault is unavailable")
      const marker = await captureOfflineMarker().catch(() => undefined)
      try {
        const saved = await saveVault(snapshot.revision, encrypted)
        const next = { ...snapshot, ...saved, encrypted }
        if (marker) await refreshOfflineVault(next, marker).catch(() => {})
        setSnapshot(next)
        return { next, marker }
      } catch (error) {
        if (
          marker &&
          error instanceof VaultRequestError &&
          [401, 403].includes(error.status)
        ) {
          await clearOfflineVault({ marker }).catch(() => {})
        }
        throw error
      }
    },
    [snapshot]
  )

  const confirm = useCallback(
    () =>
      run(async (current) => {
        if (!prepared) return
        const { next, marker } = await persist(prepared.encrypted)
        if (current()) {
          setOpen({ key: prepared.key, entries: prepared.entries })
          setPrepared(undefined)
          if (prepared.renewOfflineLease) void prepareOfflineCopy(next, marker)
        }
      }),
    [persist, prepared, run]
  )

  const cancelPreparation = useCallback(() => setPrepared(undefined), [])

  const updateEntries = useCallback(
    (entries: VaultEntry[]) =>
      run(async (current) => {
        if (!snapshot?.encrypted || !open) return
        const box = await encryptEntries(snapshot.ownerId, open.key, entries)
        if (!current()) return
        await persist({ ...snapshot.encrypted, entries: box })
        if (current()) setOpen({ key: open.key, entries })
      }),
    [open, persist, run, snapshot]
  )

  const addPasskey = useCallback(
    () =>
      run(async (current) => {
        if (!snapshot?.encrypted || !open) return
        const { ownerId, encrypted } = snapshot
        const { id, salt, result } = await registerPasskey(
          ownerId,
          encrypted.passkeys
        )
        const wrapper = await wrapPasskey(ownerId, id, salt, result, open.key)
        if (!current()) return
        await persist({
          ...encrypted,
          passkeys: [...encrypted.passkeys, wrapper],
        })
        if (current()) rememberPasskey(ownerId, id)
      }, "passkeySetupFailed"),
    [open, persist, run, snapshot]
  )

  const removePasskeys = useCallback(
    () =>
      run(async () => {
        if (snapshot?.encrypted && open)
          await persist({ ...snapshot.encrypted, passkeys: [] })
      }),
    [open, persist, run, snapshot]
  )

  return {
    addPasskey,
    busy,
    cancelPreparation,
    confirm,
    dismissAutomaticPasskey,
    error,
    lock,
    open,
    prepare,
    prepared,
    reload,
    removePasskeys,
    snapshot,
    unlock,
    updateEntries,
  }
}

export type VaultController = ReturnType<typeof useVault>
