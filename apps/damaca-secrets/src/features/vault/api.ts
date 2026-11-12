import {
  type EncryptedVault,
  VAULT_BODY_LIMIT,
  vaultReadSchema,
  vaultSaveSchema,
} from "@/schemas/vault"

export class VaultRequestError extends Error {
  constructor(readonly status: number) {
    super(
      status === 409
        ? "The vault changed on another device. Reload the latest version before editing."
        : status === 413
          ? "The vault has reached its storage limit."
          : status === 401 || status === 403
            ? "Your access has ended. Sign in again to continue."
            : "The vault could not be reached. Try again."
    )
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
