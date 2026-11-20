import { z } from "zod"
import {
  encryptedBoxSchema,
  offlineLeaseFields,
  passwordKeySchema,
  type VaultRead,
} from "@/schemas/vault"

const offlineSnapshot = z.strictObject({
  ...offlineLeaseFields,
  ownerId: z.string().min(1),
  generation: z.number().int().nonnegative().optional(),
  revision: z.number().int().positive(),
  password: passwordKeySchema,
  entries: encryptedBoxSchema,
})

export const offlineStateSchema = z.strictObject({
  marker: z.uuid(),
  disabled: z.literal(true).optional(),
  preparationFailed: z.literal(true).optional(),
  snapshot: offlineSnapshot.optional(),
})

export type OfflineState = z.infer<typeof offlineStateSchema>
export type OfflineSnapshot = z.infer<typeof offlineSnapshot>

export function toOfflineSnapshot(
  vault: VaultRead
): OfflineSnapshot | undefined {
  if (!vault.encrypted) return
  return {
    ownerId: vault.ownerId,
    ...(vault.generation ? { generation: vault.generation } : {}),
    revision: vault.revision,
    checkedAt: vault.checkedAt,
    expiresAt: vault.expiresAt,
    password: vault.encrypted.password,
    entries: vault.encrypted.entries,
  }
}

export function isOfflineSnapshotUsable(
  snapshot: OfflineSnapshot,
  now = Date.now()
) {
  return now >= snapshot.checkedAt && now < snapshot.expiresAt
}
