import "server-only"

import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { getMongoDatabase } from "@/lib/db/client"

export function createAuthAdapter() {
  return mongodbAdapter(getMongoDatabase(), { transaction: false })
}
