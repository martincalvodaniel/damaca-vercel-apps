import "server-only"

import { MongoServerError, type ObjectId } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { ContactRecoveryPolicy } from "@/schemas/contact-recovery"
import type { EncryptedVault, VaultRead } from "@/schemas/vault"

interface VaultDocument {
  _id: string
  revision: number
  generation?: number
  resetId?: string
  contactRecovery?: ContactRecoveryPolicy
  encrypted: EncryptedVault
}

function vaults() {
  return getCollection<VaultDocument>(COLLECTION_NAMES.vaults)
}

export async function readVault(
  ownerId: string
): Promise<
  Pick<VaultRead, "ownerId" | "revision" | "generation" | "encrypted">
> {
  const result = await (await vaults()).findOne({ _id: ownerId })
  return {
    ownerId,
    generation: result?.generation ?? 0,
    revision: result?.revision ?? 0,
    encrypted: result?.encrypted ?? null,
  }
}

export async function writeVault(
  ownerId: string,
  revision: number,
  encrypted: EncryptedVault
): Promise<boolean> {
  const collection = await vaults()
  if (revision === 0) {
    try {
      await collection.insertOne({ _id: ownerId, revision: 1, encrypted })
      return true
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        return false
      throw error
    }
  }

  const current = await collection.findOne(
    { _id: ownerId, revision },
    {
      projection: { "encrypted.recovery": 1 },
    }
  )
  if (!current) return false
  const rotated =
    current.encrypted.recovery.nonce !== encrypted.recovery.nonce ||
    current.encrypted.recovery.ciphertext !== encrypted.recovery.ciphertext
  const result = await collection.updateOne(
    { _id: ownerId, revision },
    {
      $set: { encrypted },
      $inc: { revision: 1, ...(rotated ? { generation: 1 } : {}) },
      ...(rotated ? { $unset: { contactRecovery: "" } } : {}),
    }
  )
  return result.modifiedCount === 1
}

export async function setVaultResetIntent(
  ownerId: string,
  revision: number,
  resetId: string
) {
  const result = await (await vaults()).updateOne(
    { _id: ownerId, revision },
    { $set: { resetId } }
  )
  return result.matchedCount === 1
}

export async function cancelVaultResetIntent(ownerId: string, resetId: string) {
  await (await vaults()).updateOne(
    { _id: ownerId, resetId },
    { $unset: { resetId: "" } }
  )
}

export async function replaceVault(
  ownerId: string,
  revision: number,
  resetId: string,
  encrypted: EncryptedVault
) {
  const result = await (await vaults()).updateOne(
    { _id: ownerId, revision, resetId },
    {
      $set: { encrypted },
      $inc: { revision: 1, generation: 1 },
      $unset: { resetId: "", contactRecovery: "" },
    }
  )
  return result.modifiedCount === 1
}

export async function findContactRecovery(ownerId: string) {
  return (await vaults()).findOne(
    { _id: ownerId },
    {
      projection: { revision: 1, contactRecovery: 1, resetId: 1 },
    }
  )
}

export async function findRecoveryInvitations(email: string) {
  return (await vaults())
    .find(
      { "contactRecovery.contacts.email": email },
      {
        projection: { contactRecovery: 1 },
      }
    )
    .toArray()
}

export async function findRecoveryContact(email: string) {
  const users = await getCollection<{
    _id: string | ObjectId
    email: string
    emailVerified: boolean
  }>(COLLECTION_NAMES.authUsers)
  return users.findOne(
    { email, emailVerified: true },
    { projection: { email: 1 } }
  )
}

export async function saveContactRecovery(
  ownerId: string,
  revision: number,
  previous: ContactRecoveryPolicy | undefined,
  policy: ContactRecoveryPolicy,
  authorizationId?: string
) {
  const result = await (await vaults()).updateOne(
    {
      _id: ownerId,
      revision,
      ...(authorizationId ? { resetId: authorizationId } : {}),
      ...(previous
        ? {
            "contactRecovery.id": previous.id,
            "contactRecovery.version": previous.version,
          }
        : { contactRecovery: { $exists: false } }),
    },
    { $set: { contactRecovery: policy } }
  )
  return result.modifiedCount === 1
}

export async function completeContactRecovery(
  ownerId: string,
  revision: number,
  policy: ContactRecoveryPolicy,
  now: number,
  authorizationId: string,
  encrypted: EncryptedVault
) {
  const result = await (await vaults()).updateOne(
    {
      _id: ownerId,
      revision,
      "contactRecovery.id": policy.id,
      "contactRecovery.version": policy.version,
      resetId: authorizationId,
      "contactRecovery.request.expiresAt": { $gt: now },
    },
    {
      $set: { encrypted },
      $inc: { generation: 1, revision: 1 },
      $unset: { contactRecovery: "", resetId: "" },
    }
  )
  return result.modifiedCount === 1
}
