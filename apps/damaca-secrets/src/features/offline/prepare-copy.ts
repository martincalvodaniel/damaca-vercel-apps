"use client"

import { loadOnlineSnapshot } from "@/features/offline/online-snapshot"
import { prepareOfflineShell } from "@/lib/offline/client"
import {
  markOfflinePreparationFailed,
  readOfflineState,
  storeOfflineVault,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  toOfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultRead } from "@/schemas/vault"

export async function prepareOfflineCopy(vault: VaultRead, marker?: string) {
  if (!marker) return
  const copy = toOfflineSnapshot(vault)
  if (!copy || !isOfflineSnapshotUsable(copy)) return
  try {
    const state = await readOfflineState()
    if (state?.marker !== marker || state.disabled) return
    await prepareOfflineShell()
    if ((await storeOfflineVault(copy, marker)) && !state.snapshot) {
      // Catch saves another tab completed while the worker was installing.
      await loadOnlineSnapshot().catch(() => {})
    }
  } catch {
    await markOfflinePreparationFailed(marker).catch(() => {})
  }
}
