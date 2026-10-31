import "server-only"

import { type Db, MongoClient } from "mongodb"
import { getDatabaseEnv } from "@/config/env"
import { ensureIndexes } from "@/lib/db/ensure-indexes"

interface MongoGlobal {
  mongoClientPromise?: Promise<MongoClient>
}

const databaseEnv = getDatabaseEnv()
const mongoGlobal = globalThis as typeof globalThis & MongoGlobal

let clientPromise: Promise<MongoClient> | undefined

function createClientPromise(): Promise<MongoClient> {
  return new MongoClient(databaseEnv.uri).connect()
}

function getClientPromise(): Promise<MongoClient> {
  if (databaseEnv.isDevelopment) {
    if (!mongoGlobal.mongoClientPromise) {
      const connection = createClientPromise()
      mongoGlobal.mongoClientPromise = connection
      connection.catch(() => {
        if (mongoGlobal.mongoClientPromise === connection) {
          mongoGlobal.mongoClientPromise = undefined
        }
      })
    }

    return mongoGlobal.mongoClientPromise
  }

  if (!clientPromise) {
    const connection = createClientPromise()
    clientPromise = connection
    connection.catch(() => {
      if (clientPromise === connection) {
        clientPromise = undefined
      }
    })
  }

  return clientPromise
}

let indexesPromise: Promise<void> | undefined

async function ensureIndexesOnce(database: Db): Promise<void> {
  if (!indexesPromise) {
    indexesPromise = ensureIndexes(database).catch((error: unknown) => {
      indexesPromise = undefined
      throw error
    })
  }

  await indexesPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise()
  const database = client.db(databaseEnv.databaseName)

  await ensureIndexesOnce(database)

  return database
}

export async function closeDatabaseConnection(): Promise<void> {
  const activeClientPromise = databaseEnv.isDevelopment
    ? mongoGlobal.mongoClientPromise
    : clientPromise

  if (!activeClientPromise) {
    return
  }

  try {
    const client = await activeClientPromise
    await client.close()
  } finally {
    indexesPromise = undefined
    clientPromise = undefined

    if (databaseEnv.isDevelopment) {
      mongoGlobal.mongoClientPromise = undefined
    }
  }
}
