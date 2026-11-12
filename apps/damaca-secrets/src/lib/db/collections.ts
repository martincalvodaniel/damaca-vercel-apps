import "server-only"

import type { Collection, Document } from "mongodb"
import { getDatabase } from "@/lib/db/client"

// Register collection names here alongside the feature that introduces them.
export const COLLECTION_NAMES = {
  authUsers: "auth_users",
  authSessions: "auth_sessions",
  authAccounts: "auth_accounts",
  authVerifications: "auth_verifications",
  vaults: "vaults",
  userAccess: "user_access",
} as const satisfies Record<string, string>

export type CollectionName =
  (typeof COLLECTION_NAMES)[keyof typeof COLLECTION_NAMES]

export async function getCollection<Schema extends Document>(
  name: CollectionName
): Promise<Collection<Schema>> {
  const database = await getDatabase()
  return database.collection<Schema>(name)
}
