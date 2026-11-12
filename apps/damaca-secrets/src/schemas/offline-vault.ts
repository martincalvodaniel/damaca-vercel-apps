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
  revision: z.number().int().positive(),
  password: passwordKeySchema,
  entries: encryptedBoxSchema,
})

export const offlineStateSchema = z.strictObject({
  marker: z.uuid(),
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
