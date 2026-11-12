"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
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
import { authenticatePasskey, registerPasskey } from "@/features/vault/passkeys"
import { useIdleLock } from "@/features/vault/use-idle-lock"
import {
  clearOfflineVault,
  readOfflineVault,
  refreshOfflineVault,
  subscribeToOfflineReset,
} from "@/lib/offline/storage"
import type { EncryptedVault, VaultEntry, VaultRead } from "@/schemas/vault"

type OpenVault = { key: CryptoKey; entries: VaultEntry[] }
type PreparedVault = Awaited<ReturnType<typeof prepareVault>> & {
  entries: VaultEntry[]
}

export function useVault() {
  const [snapshot, setSnapshot] = useState<VaultRead>()
  const [open, setOpen] = useState<OpenVault>()
  const [prepared, setPrepared] = useState<PreparedVault>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const epoch = useRef(0)
  const running = useRef(false)

  const lock = useCallback(() => {
    epoch.current++
    setOpen(undefined)
    setPrepared(undefined)
    setError("")
  }, [])

  const offline = useCallback(async () => {
    lock()
    setSnapshot(undefined)
    if (await readOfflineVault().catch(() => undefined)) {
      window.location.replace("/offline-vault")
      return
    }
    setError(
      "You are offline. Enable offline access when connected to consult this vault without coverage."
    )
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
          error instanceof VaultRequestError
            ? error.message
            : "Could not load the vault."
        )
      })
    const onOffline = () => void offline()
    window.addEventListener("offline", onOffline)
    const stop = subscribeToOfflineReset(lock)
    return () => {
      epoch.current++
      controller.abort()
      window.removeEventListener("offline", onOffline)
      stop()
    }
  }, [lock, offline])

  useIdleLock(Boolean(open || prepared), lock)

  const run = useCallback(
    async (
      operation: (current: () => boolean) => Promise<void>,
      message = "Could not open or update the vault."
    ) => {
      if (running.current) return false
      running.current = true
      const previous = epoch.current
      const current = () => epoch.current === previous
      setBusy(true)
      setError("")
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
            if (error.status !== 409) await clearOfflineVault().catch(() => {})
          }
          setError(error instanceof VaultRequestError ? error.message : message)
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
      }, "Could not load the vault."),
    [run]
  )

  const unlock = useCallback(
    (method: "password" | "passkey", password = "") =>
      run(
        async (current) => {
          if (!snapshot?.encrypted) return
          const { ownerId, encrypted } = snapshot
          const credential =
            method === "passkey"
              ? await authenticatePasskey(encrypted.passkeys)
              : undefined
          try {
            const latest = await loadOnlineSnapshot()
            if (
              latest.ownerId !== ownerId ||
              latest.revision !== snapshot.revision
            ) {
              throw new VaultRequestError(409)
            }
          } catch (error) {
            if (credential) new Uint8Array(credential.result).fill(0)
            throw error
          }
          let key: CryptoKey
          if (credential) {
            const passkey = encrypted.passkeys.find(
              ({ id }) => id === credential.id
            )
            if (!passkey) throw new Error("Unknown passkey")
            key = await unlockPasskey(ownerId, passkey, credential.result)
          } else {
            key = await unlockPassword(ownerId, password, encrypted.password)
          }
          const entries = await decryptEntries(ownerId, key, encrypted.entries)
          if (current()) setOpen({ key, entries })
        },
        method === "password"
          ? "Could not unlock with that master password."
          : "Could not unlock with this passkey. You can use your master password."
      ),
    [run, snapshot]
  )

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
          if (current()) setPrepared({ ...next, entries })
        },
        recoveryCode
          ? "Could not recover with that code."
          : "Check the master password and try again."
      ),
    [run, snapshot]
  )

  const persist = useCallback(
    async (encrypted: EncryptedVault) => {
      if (!snapshot) throw new Error("Vault is unavailable")
      const saved = await saveVault(snapshot.revision, encrypted)
      const next = { ...snapshot, ...saved, encrypted }
      await refreshOfflineVault(next).catch(() => {})
      setSnapshot(next)
    },
    [snapshot]
  )

  const confirm = useCallback(
    () =>
      run(async (current) => {
        if (!prepared) return
        await persist(prepared.encrypted)
        if (current()) {
          setOpen({ key: prepared.key, entries: prepared.entries })
          setPrepared(undefined)
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
        if (current())
          await persist({
            ...encrypted,
            passkeys: [...encrypted.passkeys, wrapper],
          })
      }, "Passkey setup failed. Choose a device or provider that supports WebAuthn PRF."),
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
