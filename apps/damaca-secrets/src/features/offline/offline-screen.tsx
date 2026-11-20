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
import { useLocale } from "@/lib/i18n/client"
import { formatOfflineDates, type MessageKey } from "@/lib/i18n/messages"
import {
  readOfflineVault,
  subscribeToOfflineReset,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  type OfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultEntry } from "@/schemas/vault"

const reconnect = "reconnect"
const expiry = "offlineExpired"

export function OfflineScreen() {
  const { locale, t } = useLocale()
  const [snapshot, setSnapshot] = useState<OfflineSnapshot>()
  const [entries, setEntries] = useState<VaultEntry[]>()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<MessageKey | undefined>(
    "checkingOffline"
  )
  const [error, setError] = useState<MessageKey>()
  const epoch = useRef(0)

  const lock = useCallback(() => {
    epoch.current++
    setEntries(undefined)
    setError(undefined)
  }, [])
  const invalidate = useCallback(
    (message: MessageKey) => {
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
          invalidate("accessEnded")
          return
        }
        if (!isTransportFailure(error)) {
          invalidate("verifyAccessFailed")
          return
        }
        if (denied) return
        const local = await readOfflineVault().catch(() => undefined)
        if (!active) return
        if (!local) invalidate(reconnect)
        else if (!isOfflineSnapshotUsable(local)) invalidate(expiry)
        else {
          setSnapshot(local)
          setStatus(undefined)
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
      setError(undefined)
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
        if (epoch.current === current) setError("unlockPasswordFailed")
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
      <h1 className="sr-only">{t.offlineVault}</h1>
      {entries ? (
        <div className="flex justify-end">
          <IconButton
            icon="lock"
            tone="security"
            label={t.lockVault}
            onClick={lock}
          />
        </div>
      ) : null}
      {status ? (
        <p role="status" className="text-sm">
          {t[status]}
        </p>
      ) : null}
      {snapshot ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {formatOfflineDates(locale, snapshot.expiresAt, true)}
        </p>
      ) : null}
      {error ? <ErrorBanner>{t[error]}</ErrorBanner> : null}
      {snapshot && !entries ? (
        <UnlockForm busy={busy} hasPasskey={false} onUnlock={unlock} />
      ) : null}
      {entries ? <VaultEntries busy={false} entries={entries} /> : null}
    </main>
  )
}
