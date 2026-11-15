"use client"

import { useCallback, useEffect, useState } from "react"
import { buttonClass } from "@/features/vault/components/styles"
import { useLocale } from "@/lib/i18n/client"
import { formatOfflineDates, type MessageKey } from "@/lib/i18n/messages"
import {
  readOfflineState,
  setOfflineEnabled,
  subscribeToOfflineChanges,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  type OfflineState,
} from "@/schemas/offline-vault"

export function OfflineSettings({ ownerId }: { ownerId: string }) {
  const { locale, t } = useLocale()
  const [state, setState] = useState<OfflineState>()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<MessageKey>()
  const [now, setNow] = useState(Date.now)
  const snapshot =
    state?.snapshot?.ownerId === ownerId ? state.snapshot : undefined
  const expiresAt = snapshot?.expiresAt

  useEffect(() => {
    let active = true
    let sequence = 0
    async function read() {
      const request = ++sequence
      try {
        const stored = await readOfflineState()
        if (active && request === sequence) {
          setState(stored)
          setNow(Date.now())
          setError((current) =>
            current === "offlineStorageUnavailable" ? undefined : current
          )
        }
      } catch {
        if (active && request === sequence)
          setError("offlineStorageUnavailable")
      } finally {
        if (active && request === sequence) setLoading(false)
      }
    }

    void read()
    const unsubscribe = subscribeToOfflineChanges(() => void read())
    const onFocus = () => void read()
    window.addEventListener("focus", onFocus)
    return () => {
      active = false
      unsubscribe()
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  useEffect(() => {
    if (!expiresAt || expiresAt <= now) return
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2147483647, expiresAt - now)
    )
    return () => clearTimeout(timer)
  }, [expiresAt, now])

  const disabled = Boolean(state?.disabled)
  const toggle = useCallback(async () => {
    setBusy(true)
    setError(undefined)
    try {
      await setOfflineEnabled(disabled)
      setState(await readOfflineState())
      setNow(Date.now())
    } catch {
      setError("offlineUpdateFailed")
    } finally {
      setBusy(false)
    }
  }, [disabled])

  let status = t.offlineExplanation
  if (busy) status = t.updatingOffline
  else if (loading) status = t.checkingOffline
  else if (disabled) status = t.offlineDisabled
  else if (state?.preparationFailed) status = t.offlinePreparationFailed
  else if (snapshot) {
    status = isOfflineSnapshotUsable(snapshot, now)
      ? formatOfflineDates(locale, snapshot.expiresAt)
      : t.offlineExpired
  }

  return (
    <section
      aria-label={t.offlineAccess}
      className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">{t.offlineAccess}</h2>
        <button
          type="button"
          onClick={toggle}
          disabled={busy || loading || error === "offlineStorageUnavailable"}
          className={buttonClass}
        >
          {disabled ? t.enableOffline : t.disableOffline}
        </button>
      </div>
      <p role="status" className="text-xs text-zinc-600 dark:text-zinc-400">
        {status}
      </p>
      {error ? (
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {t[error]}
        </p>
      ) : null}
    </section>
  )
}
