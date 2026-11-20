import type { z } from "zod"
import type {
  contactRecoveryAction,
  RecoveryContact,
  RecoveryRequest,
} from "@/schemas/contact-recovery"
import type { EncryptedVault } from "@/schemas/vault"

export interface ContactRecoveryView {
  ownerId: string
  revision?: number
  policy?: {
    id: string
    active: boolean
    contacts: Pick<RecoveryContact, "id" | "email" | "publicKey">[]
    request?: Omit<RecoveryRequest, "approvals"> & {
      count: number
      approvals?: RecoveryRequest["approvals"]
      box?: EncryptedVault["entries"]
    }
  }
  invitations: {
    ownerId: string
    ownerEmail?: string
    policyId: string
    publicKey?: string
    request?: { id: string; publicKey: string; share: string }
  }[]
}

export async function readContacts(
  signal?: AbortSignal
): Promise<ContactRecoveryView> {
  const result = await fetch("/api/vault/contacts", {
    signal,
    cache: "no-store",
  })
  if (!result.ok) throw new Error("Could not load contact recovery")
  return result.json()
}

export async function updateContacts(
  action: z.infer<typeof contactRecoveryAction>
) {
  const result = await fetch("/api/vault/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  })
  if (!result.ok) throw new Error("Contact recovery operation failed")
}

export async function authorizeRecovery(action: "start" | "claim") {
  const result = await fetch("/api/vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(`${action}-contacts`),
  })
  if (!result.ok) throw new Error("Google verification is required")
}
