import "server-only"

import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { getDatabase } from "@/lib/db/client"

export async function getAuthDatabaseAdapter() {
  return mongodbAdapter(await getDatabase())
}
