"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
import { isTransportFailure, VaultRequestError } from "@/features/vault/api"
import { UnlockForm } from "@/features/vault/components/unlock-form"
import { VaultEntries } from "@/features/vault/components/vault-entries"
import { decryptEntries, unlockPassword } from "@/features/vault/crypto"
import { useIdleLock } from "@/features/vault/use-idle-lock"
import {
  readOfflineVault,
  subscribeToOfflineReset,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  type OfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultEntry } from "@/schemas/vault"

const reconnect = "Reconnect to sync this vault."
const expiry = "Offline access expired. Reconnect to sync this vault."

export function OfflineScreen() {
  const [snapshot, setSnapshot] = useState<OfflineSnapshot>()
  const [entries, setEntries] = useState<VaultEntry[]>()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState("Checking offline access…")
  const [error, setError] = useState("")
  const epoch = useRef(0)

  const lock = useCallback(() => {
    epoch.current++
    setEntries(undefined)
    setError("")
  }, [])
  const invalidate = useCallback(
    (message: string) => {
      lock()
      setSnapshot(undefined)
      setStatus(message)
    },
    [lock]
  )

  useIdleLock(Boolean(entries), lock)

  useEffect(() => {
    let active = true
    let checking = false
    let recheck = false
    let denied = false

    async function check() {
      if (checking) {
        recheck = true
        return
      }
      checking = true
      try {
        await loadOnlineSnapshot(AbortSignal.timeout(4500))
        if (active) {
          lock()
          window.location.replace("/")
        }
      } catch (error) {
        if (!active) return
        if (
          error instanceof VaultRequestError &&
          [401, 403].includes(error.status)
        ) {
          denied = true
          invalidate("Your access has ended. Sign in again to continue.")
          return
        }
        if (!isTransportFailure(error)) {
          invalidate("Could not verify access. Try again when connected.")
          return
        }
        if (denied) return
        const local = await readOfflineVault().catch(() => undefined)
        if (!active) return
        if (!local) invalidate(reconnect)
        else if (!isOfflineSnapshotUsable(local)) invalidate(expiry)
        else {
          setSnapshot(local)
          setStatus("")
        }
      } finally {
        checking = false
        if (active && recheck) {
          recheck = false
          void check()
        }
      }
    }

    void check()
    const refresh = () => void check()
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }
    window.addEventListener("online", refresh)
    window.addEventListener("pageshow", refresh)
    document.addEventListener("visibilitychange", onVisible)
    const timer = setInterval(refresh, 30000)
    const stop = subscribeToOfflineReset(() => {
      if (!denied) invalidate(reconnect)
    })
    return () => {
      active = false
      epoch.current++
      clearInterval(timer)
      window.removeEventListener("online", refresh)
      window.removeEventListener("pageshow", refresh)
      document.removeEventListener("visibilitychange", onVisible)
      stop()
    }
  }, [invalidate, lock])

  useEffect(() => {
    if (!snapshot) return
    const expiration = () => {
      if (!isOfflineSnapshotUsable(snapshot)) invalidate(expiry)
    }
    const timeout = setTimeout(
      expiration,
      Math.min(2147483647, Math.max(0, snapshot.expiresAt - Date.now()))
    )
    document.addEventListener("visibilitychange", expiration)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener("visibilitychange", expiration)
    }
  }, [invalidate, snapshot])

  const unlock = useCallback(
    async (method: "password" | "passkey", password = "") => {
      if (method !== "password" || !snapshot || busy) return false
      setBusy(true)
      setError("")
      const current = epoch.current
      try {
        if (!isOfflineSnapshotUsable(snapshot)) {
          invalidate(expiry)
          return false
        }
        const key = await unlockPassword(
          snapshot.ownerId,
          password,
          snapshot.password
        )
        const values = await decryptEntries(
          snapshot.ownerId,
          key,
          snapshot.entries
        )
        const local = await readOfflineVault()
        if (epoch.current !== current) return false
        if (
          !local ||
          local.ownerId !== snapshot.ownerId ||
          local.revision !== snapshot.revision ||
          local.checkedAt !== snapshot.checkedAt ||
          !isOfflineSnapshotUsable(local)
        ) {
          invalidate(reconnect)
          return false
        }
        setEntries(values)
        return true
      } catch {
        if (epoch.current === current)
          setError("Could not unlock with that master password.")
        return false
      } finally {
        setBusy(false)
      }
    },
    [busy, invalidate, snapshot]
  )

  return (
    <main
      data-offline-shell="damaca-secrets"
      className="mx-auto grid w-full max-w-3xl gap-3 px-3 py-3 sm:px-6 sm:py-5"
    >
      <header className="flex min-h-9 items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Offline vault</h1>
        {entries ? (
          <IconButton icon="lock" label="Lock vault" onClick={lock} />
        ) : null}
      </header>
      {status ? (
        <p role="status" className="text-sm">
          {status}
        </p>
      ) : null}
      {snapshot ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Read-only copy. Synced {new Date(snapshot.checkedAt).toLocaleString()}
          . Available until {new Date(snapshot.expiresAt).toLocaleString()}.
        </p>
      ) : null}
      {error ? <ErrorBanner>{error}</ErrorBanner> : null}
      {snapshot && !entries ? (
        <UnlockForm busy={busy} hasPasskey={false} onUnlock={unlock} />
      ) : null}
      {entries ? <VaultEntries busy={false} entries={entries} /> : null}
    </main>
  )
}
