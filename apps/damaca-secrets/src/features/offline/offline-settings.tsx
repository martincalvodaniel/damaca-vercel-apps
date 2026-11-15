"use client"

import { useCallback, useEffect, useState } from "react"
import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
import { buttonClass } from "@/features/vault/components/styles"
import { useLocale } from "@/lib/i18n/client"
import { formatOfflineDates, type MessageKey } from "@/lib/i18n/messages"
import { prepareOfflineShell } from "@/lib/offline/client"
import {
  clearOfflineVault,
  enableOfflineVault,
  getOfflineMarker,
  readOfflineVault,
  subscribeToOfflineChanges,
} from "@/lib/offline/storage"
import {
  type OfflineSnapshot,
  toOfflineSnapshot,
} from "@/schemas/offline-vault"

export function OfflineSettings({ ownerId }: { ownerId: string }) {
  const { locale, t } = useLocale()
  const [snapshot, setSnapshot] = useState<OfflineSnapshot>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<MessageKey>()
  useEffect(() => {
    let active = true
    function read() {
      void readOfflineVault()
        .then((local) => {
          if (active)
            setSnapshot(local?.ownerId === ownerId ? local : undefined)
        })
        .catch(() => {})
    }
    read()
    const stop = subscribeToOfflineChanges(read)
    return () => {
      active = false
      stop()
    }
  }, [ownerId])

  const toggle = useCallback(async () => {
    setBusy(true)
    setError(undefined)
    try {
      if (snapshot) {
        await clearOfflineVault()
        setSnapshot(undefined)
      } else {
        const marker = await getOfflineMarker()
        await prepareOfflineShell()
        const fresh = await loadOnlineSnapshot(AbortSignal.timeout(8000))
        const copy = toOfflineSnapshot(fresh)
        if (!copy || copy.ownerId !== ownerId)
          throw new Error("No matching vault")
        setSnapshot(await enableOfflineVault(copy, marker))
      }
    } catch {
      setError("offlineUpdateFailed")
    } finally {
      setBusy(false)
    }
  }, [ownerId, snapshot])

  return (
    <section
      aria-label={t.offlineAccess}
      className="grid gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">{t.offlineAccess}</h2>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={buttonClass}
        >
          {snapshot ? t.disableOffline : t.enableOffline}
        </button>
      </div>
      {snapshot ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {formatOfflineDates(locale, snapshot.checkedAt, snapshot.expiresAt)}
        </p>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {t.offlineExplanation}
        </p>
      )}
      {busy ? (
        <p role="status" className="text-xs">
          {t.updatingOffline}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {t[error]}
        </p>
      ) : null}
    </section>
  )
}
