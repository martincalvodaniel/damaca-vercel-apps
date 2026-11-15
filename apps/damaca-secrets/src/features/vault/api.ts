import type { MessageKey } from "@/lib/i18n/messages"
import {
  type EncryptedVault,
  VAULT_BODY_LIMIT,
  vaultReadSchema,
  vaultSaveSchema,
} from "@/schemas/vault"

export class VaultRequestError extends Error {
  constructor(readonly status: number) {
    super(`Vault request failed with status ${status}`)
  }

  get code(): MessageKey {
    switch (this.status) {
      case 409:
        return "vaultConflict"
      case 413:
        return "vaultLimit"
      case 401:
      case 403:
        return "accessEnded"
      default:
        return "vaultUnreachable"
    }
  }
}

export async function loadVault(signal?: AbortSignal) {
  const response = await fetch("/api/vault", { cache: "no-store", signal })
  if (!response.ok) throw new VaultRequestError(response.status)
  return vaultReadSchema.parse(await response.json())
}

export async function saveVault(revision: number, encrypted: EncryptedVault) {
  const body = JSON.stringify({ revision, encrypted })
  if (body.length > VAULT_BODY_LIMIT) throw new VaultRequestError(413)
  const response = await fetch("/api/vault", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  })
  if (!response.ok) throw new VaultRequestError(response.status)
  return vaultSaveSchema.parse(await response.json())
}

export function isTransportFailure(error: unknown) {
  return (
    error instanceof TypeError ||
    (error instanceof DOMException && error.name === "TimeoutError")
  )
}
