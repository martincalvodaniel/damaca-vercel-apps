import { z } from "zod"
import { encryptedBoxSchema, vaultResetSchema, vaultWriteSchema } from "./vault"

const publicKey = z
  .string()
  .min(500)
  .max(650)
  .regex(/^[A-Za-z0-9_-]+$/u)
const encryptedShare = z
  .string()
  .length(512)
  .regex(/^[A-Za-z0-9_-]+$/u)
const contactEmails = z.tuple([z.email(), z.email(), z.email()])
const routeId = { ownerId: z.string().min(1).max(128), policyId: z.uuid() }

export const contactRecoveryAction = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("invite"), emails: contactEmails }),
  z.strictObject({ action: z.literal("accept"), ...routeId, publicKey }),
  z.strictObject({
    action: z.literal("activate"),
    policyId: z.uuid(),
    revision: vaultWriteSchema.shape.revision,
    box: encryptedBoxSchema,
    envelopes: z
      .array(
        z.strictObject({ contactId: routeId.ownerId, share: encryptedShare })
      )
      .length(3),
  }),
  z.strictObject({
    action: z.literal("request"),
    publicKey,
    requestId: z.uuid(),
  }),
  z.strictObject({
    action: z.literal("approve"),
    ...routeId,
    requestId: z.uuid(),
    share: encryptedShare,
  }),
  z.strictObject({ action: z.literal("cancel"), requestId: z.uuid() }),
  vaultResetSchema.omit({ encrypted: true }).extend({
    action: z.literal("complete"),
    requestId: z.uuid(),
    encrypted: vaultWriteSchema.shape.encrypted,
  }),
])

export interface RecoveryContact {
  id: string
  email: string
  publicKey?: string
  share?: string
}

export interface RecoveryRequest {
  id: string
  publicKey: string
  expiresAt: number
  approvals: { contactId: string; share: string }[]
}

export interface ContactRecoveryPolicy {
  ownerEmail: string
  id: string
  version: number
  contacts: RecoveryContact[]
  box?: z.infer<typeof encryptedBoxSchema>
  request?: RecoveryRequest
}
