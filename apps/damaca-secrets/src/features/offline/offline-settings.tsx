"use client"

import { useCallback, useEffect, useState } from "react"
import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
import { buttonClass } from "@/features/vault/components/styles"
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
  const [snapshot, setSnapshot] = useState<OfflineSnapshot>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
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
    setError("")
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
      setError(
        "Could not update offline access. Check your connection and browser storage."
      )
    } finally {
      setBusy(false)
    }
  }, [ownerId, snapshot])

  return (
    <section
      aria-label="Offline access"
      className="grid gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium">Offline access</h2>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={buttonClass}
        >
          {snapshot ? "Disable offline access" : "Enable offline access"}
        </button>
      </div>
      {snapshot ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Synced {new Date(snapshot.checkedAt).toLocaleString()}. Available
          until {new Date(snapshot.expiresAt).toLocaleString()}.
        </p>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Save an encrypted copy for read-only access on this trusted browser.
        </p>
      )}
      {busy ? (
        <p role="status" className="text-xs">
          Updating offline access…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </section>
  )
}
