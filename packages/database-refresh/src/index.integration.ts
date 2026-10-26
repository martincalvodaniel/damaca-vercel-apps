import "server-only"

import assert from "node:assert/strict"
import { MongoClient } from "mongodb"
import {
  hasActiveRefresh,
  refreshDatabase,
  requireDatabaseRefreshManifest,
} from "./index.js"

const uri = process.env.DATABASE_REFRESH_TEST_URI ?? ""
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/?(?:\?[^/ ]+)?$/u.test(uri)) {
  throw new Error("Integration requires a MongoDB URI on loopback")
}

const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8)
const sourceDatabase = `database_refresh_source_${suffix}`
const targetDatabase = `database_refresh_target_${suffix}`
type TestDocument = { _id: string; [key: string]: unknown }
const client = new MongoClient(uri)

try {
  await client.connect()
  const source = client.db(sourceDatabase)
  const target = client.db(targetDatabase)

  await source.collection<TestDocument>("applications").insertMany([
    { _id: "billing-poc", name: "Billing" },
    { _id: "dalis-tasks", name: "Tasks" },
  ])
  await source
    .collection<TestDocument>("applications")
    .createIndex({ name: 1 }, { name: "application_name" })
  await source
    .collection<TestDocument>("users")
    .insertOne({ _id: "production-user" })
  await source
    .collection<TestDocument>("users")
    .createIndex(
      { email: 1 },
      { name: "email_unique", unique: true, sparse: true }
    )
  await target
    .collection<TestDocument>("applications")
    .insertOne({ _id: "stale" })
  await target.collection<TestDocument>("users").insertOne({ _id: "int-user" })
  await target
    .collection<TestDocument>("users")
    .createIndex({ intOnly: 1 }, { name: "int_only_index" })
  await target
    .collection<TestDocument>("int_oidc_clients")
    .insertOne({ _id: "local-client" })
  await target
    .collection<TestDocument>("int_oidc_clients")
    .createIndex({ clientId: 1 }, { name: "local_client_lookup" })

  const result = await refreshDatabase({
    sourceUri: uri,
    sourceDatabase,
    targetUri: uri,
    targetDatabase,
    collections: {
      applications: "copy",
      users: "preserve",
      int_oidc_clients: "preserve",
    },
    batchSize: 1,
  })

  assert.equal(result.copiedCollections, 1)
  assert.deepEqual(
    (
      await target
        .collection<TestDocument>("applications")
        .find()
        .sort({ _id: 1 })
        .toArray()
    ).map(({ _id }) => _id),
    ["billing-poc", "dalis-tasks"]
  )
  assert.deepEqual(
    await target.collection<TestDocument>("users").findOne({ _id: "int-user" }),
    {
      _id: "int-user",
    }
  )
  assert.deepEqual(
    (
      await target.collection<TestDocument>("users").listIndexes().toArray()
    ).map(({ name }) => name),
    ["_id_", "email_unique"]
  )
  assert.deepEqual(
    await target
      .collection<TestDocument>("int_oidc_clients")
      .findOne({ _id: "local-client" }),
    { _id: "local-client" }
  )
  assert.deepEqual(
    (
      await target
        .collection<TestDocument>("int_oidc_clients")
        .listIndexes()
        .toArray()
    ).map(({ name }) => name),
    ["_id_", "local_client_lookup"]
  )
  await requireDatabaseRefreshManifest(target)
  assert.equal(await hasActiveRefresh(target), false)
  console.log("Database refresh MongoDB integration passed")
} finally {
  await Promise.allSettled([
    client.db(sourceDatabase).dropDatabase(),
    client.db(targetDatabase).dropDatabase(),
  ])
  await client.close()
}
