import { z } from "zod"

export const VAULT_BODY_LIMIT = 2 * 1024 * 1024
export const MAX_PASSKEYS = 8

const base64Url = /^[A-Za-z0-9_-]+$/u
const bytes = (length: number) =>
  z
    .string()
    .length(Math.ceil((length * 4) / 3))
    .regex(base64Url)

const box = z.strictObject({
  nonce: bytes(12),
  ciphertext: z.string().min(22).max(VAULT_BODY_LIMIT).regex(base64Url),
})
const wrappedKey = box.extend({ ciphertext: bytes(48) })

export const passwordKeySchema = z.strictObject({
  salt: bytes(16),
  box: wrappedKey,
})

const passkeySchema = z.strictObject({
  id: z.string().min(1).max(2048).regex(base64Url),
  salt: bytes(32),
  box: wrappedKey,
})

export const encryptedVaultSchema = z.strictObject({
  version: z.literal(1),
  entries: box,
  password: passwordKeySchema,
  recovery: wrappedKey,
  passkeys: z.array(passkeySchema).max(MAX_PASSKEYS),
})

export const vaultWriteSchema = z.strictObject({
  revision: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER - 1),
  encrypted: encryptedVaultSchema,
})

export const vaultReadSchema = z.strictObject({
  ownerId: z.string().min(1),
  revision: z.number().int().nonnegative(),
  encrypted: encryptedVaultSchema.nullable(),
})

export const entrySchema = z.strictObject({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  username: z.string().max(320),
  password: z.string().max(1024),
  url: z.string().max(2048),
  notes: z.string().max(8192),
})

export const entriesSchema = z.array(entrySchema)
export const masterPasswordSchema = z.string().min(15).max(256)

export type EncryptedVault = z.infer<typeof encryptedVaultSchema>
export type VaultRead = z.infer<typeof vaultReadSchema>
export type VaultEntry = z.infer<typeof entrySchema>
