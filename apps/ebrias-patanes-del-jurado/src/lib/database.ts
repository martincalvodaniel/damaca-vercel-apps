import "server-only"

import { MongoClient } from "mongodb"
import { getAuthEnvironment } from "@/config/auth-env"

let connection: { client: MongoClient; databaseName: string } | undefined

export function getDatabaseConnection() {
  if (!connection) {
    const env = getAuthEnvironment()
    connection = {
      client: new MongoClient(env.mongoUri, { serverSelectionTimeoutMS: 5000 }),
      databaseName: env.databaseName,
    }
  }

  return {
    client: connection.client,
    db: connection.client.db(connection.databaseName),
  }
}
