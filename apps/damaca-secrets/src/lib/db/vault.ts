import "server-only"

import { MongoServerError } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { EncryptedVault, VaultRead } from "@/schemas/vault"

interface VaultDocument {
  _id: string
  revision: number
  encrypted: EncryptedVault
}

function vaults() {
  return getCollection<VaultDocument>(COLLECTION_NAMES.vaults)
}

export async function readVault(
  ownerId: string
): Promise<Pick<VaultRead, "ownerId" | "revision" | "encrypted">> {
  const result = await (await vaults()).findOne({ _id: ownerId })
  return {
    ownerId,
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

  const result = await collection.updateOne(
    { _id: ownerId, revision },
    { $set: { encrypted }, $inc: { revision: 1 } }
  )
  return result.modifiedCount === 1
}
