import "server-only"

import { MongoClient } from "mongodb"
import { getAuthEnv } from "@/config/env"

let client: MongoClient | undefined

export function getDatabase() {
  const { mongoUri, mongoDatabase } = getAuthEnv()
  client ??= new MongoClient(mongoUri)
  return { client, database: client.db(mongoDatabase) }
}
