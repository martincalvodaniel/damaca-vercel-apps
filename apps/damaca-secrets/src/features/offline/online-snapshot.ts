import { loadVault, VaultRequestError } from "@/features/vault/api"
import {
  captureOfflineMarker,
  clearOfflineVault,
  refreshOfflineVault,
} from "@/lib/offline/storage"

export async function loadOnlineSnapshot(signal = AbortSignal.timeout(8000)) {
  const marker = await captureOfflineMarker().catch(() => undefined)
  try {
    const snapshot = await loadVault(signal)
    if (marker && !signal.aborted)
      await refreshOfflineVault(snapshot, marker).catch(() => {})
    return snapshot
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
}
