import { loadVault, VaultRequestError } from "@/features/vault/api"
import { clearOfflineVault, refreshOfflineVault } from "@/lib/offline/storage"

export async function loadOnlineSnapshot(signal = AbortSignal.timeout(8000)) {
  try {
    const snapshot = await loadVault(signal)
    if (!signal?.aborted) await refreshOfflineVault(snapshot).catch(() => {})
    return snapshot
  } catch (error) {
    if (
      error instanceof VaultRequestError &&
      [401, 403].includes(error.status)
    ) {
      await clearOfflineVault().catch(() => {})
    }
    throw error
  }
}
