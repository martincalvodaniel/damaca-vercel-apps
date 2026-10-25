import "server-only"

import assert from "node:assert/strict"
import { MongoClient } from "mongodb"
import { getDatabaseEnv } from "@/config/env"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import {
  changeApplicationAccess,
  ensureApplicationSeeds,
  getApplicationStatus,
  listApplicationAdminData,
  listApplications,
  resolveApplicationRequest,
  saveApplication,
  submitApplicationRequest,
} from "@/lib/db/hub"

const configuration = getDatabaseEnv()
if (
  !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/?$/u.test(configuration.uri) ||
  !/^damaca_hub_test_[a-f0-9]{8}$/u.test(configuration.databaseName)
) {
  throw new Error(
    "Hub integration requires a disposable damaca_hub_test_<8 hex characters> database on loopback"
  )
}

let ownsDatabase = false

try {
  const probeClient = await new MongoClient(configuration.uri).connect()
  try {
    const existingCollections = await probeClient
      .db(configuration.databaseName)
      .listCollections()
      .toArray()
    assert.equal(
      existingCollections.length,
      0,
      "The disposable integration database must be empty before the test starts"
    )
    ownsDatabase = true
  } finally {
    await probeClient.close()
  }

  await ensureApplicationSeeds()
  const initialApplications = await listApplications()
  assert.equal(initialApplications.length, 5)

  const cardWars = initialApplications.find((app) => app.id === "card-wars")
  assert.ok(cardWars)
  await saveApplication({
    id: cardWars.id,
    name: "Customized Card Wars",
    description: cardWars.description,
    productionUrl: "https://card-wars.example.test",
    preproductionUrl: cardWars.preproductionUrl,
    order: cardWars.order,
    active: cardWars.active,
  })
  await ensureApplicationSeeds()
  assert.equal(
    (await listApplications()).find((app) => app.id === "card-wars")?.name,
    "Customized Card Wars"
  )

  const requestResults = await Promise.all(
    Array.from({ length: 8 }, () =>
      submitApplicationRequest("card-wars", " USER@example.com ")
    )
  )
  assert.equal(requestResults.filter((result) => result.created).length, 1)
  assert.equal(
    requestResults.every((result) => result.status === "pending"),
    true
  )
  assert.deepEqual(
    await submitApplicationRequest("card-wars", "user@example.com"),
    { created: false, status: "pending" }
  )

  const pending = (await listApplicationAdminData())
    .find((entry) => entry.app.id === "card-wars")
    ?.requests.find((request) => request.email === "user@example.com")
  assert.ok(pending)
  const firstRequestId = pending.requestId
  assert.equal(
    await resolveApplicationRequest(
      "card-wars",
      pending.email,
      firstRequestId,
      "reject",
      "admin@example.com"
    ),
    true
  )
  const reopened = await submitApplicationRequest("card-wars", pending.email)
  assert.equal(reopened.created, true)
  const secondRequest = (await listApplicationAdminData())
    .find((entry) => entry.app.id === "card-wars")
    ?.requests.find((request) => request.email === pending.email)
  assert.ok(secondRequest)
  assert.notEqual(secondRequest.requestId, firstRequestId)
  assert.equal(
    await resolveApplicationRequest(
      "card-wars",
      pending.email,
      firstRequestId,
      "approve",
      "admin@example.com"
    ),
    false
  )
  assert.equal(
    await resolveApplicationRequest(
      "card-wars",
      pending.email,
      secondRequest.requestId,
      "approve",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await submitApplicationRequest("card-wars", pending.email)).status,
    "approved"
  )

  await submitApplicationRequest("pocha-score", pending.email)
  assert.equal(
    (await getApplicationStatus(pending.email)).get("card-wars"),
    "approved"
  )
  assert.equal(
    (await getApplicationStatus(pending.email)).get("pocha-score"),
    "pending"
  )
  assert.equal(
    await changeApplicationAccess(
      "card-wars",
      pending.email,
      "revoke",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await getApplicationStatus(pending.email)).get("card-wars"),
    "revoked"
  )
  assert.equal(
    (await submitApplicationRequest("card-wars", pending.email)).created,
    true
  )
  assert.equal(
    await changeApplicationAccess(
      "pocha-score",
      "manual@example.com",
      "grant",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await getApplicationStatus("manual@example.com")).get("pocha-score"),
    "approved"
  )

  const database = await getDatabase()
  const appIndexes = await database
    .collection("applications")
    .listIndexes()
    .toArray()
  const accessIndexes = await database
    .collection("app_access")
    .listIndexes()
    .toArray()
  assert.equal(
    appIndexes.some(
      (index) => index.name === "application_id_unique" && index.unique
    ),
    true
  )
  assert.equal(
    accessIndexes.some(
      (index) => index.name === "app_id_asc_email_asc_unique" && index.unique
    ),
    true
  )
  console.log(
    "Damaca Hub MongoDB integration: PASS (idempotent seeds, app-scoped requests, concurrent duplicates, stale decisions, grants, revocation, isolation, indexes)"
  )
} finally {
  if (ownsDatabase) {
    const database = await getDatabase()
    await database.dropDatabase()
  }
  await closeDatabaseConnection()
}
