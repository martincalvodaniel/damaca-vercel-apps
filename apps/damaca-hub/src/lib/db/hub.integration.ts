import "server-only"

import assert from "node:assert/strict"
import { MongoClient } from "mongodb"
import { getDatabaseEnv } from "@/config/env"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import {
  changeApplicationAccess,
  ensureApplicationSeeds,
  getApplicationStatus,
  hasApplicationAccess,
  listApplicationAdminData,
  listApplications,
  resolveApplicationRequest,
  saveApplication,
  submitApplicationRequest,
} from "@/lib/db/hub"
import {
  createOidcClient,
  findOidcClient,
  hashOidcClientSecret,
  listOidcClients,
  updateOidcClient,
} from "@/lib/db/oidc-clients"

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
  assert.equal(
    initialApplications.find((app) => app.id === "pocha-score")?.publicAccess,
    true
  )
  assert.equal(
    initialApplications.find((app) => app.id === "card-wars")?.publicAccess,
    true
  )
  await assert.rejects(() =>
    submitApplicationRequest("card-wars", "user@example.com")
  )

  const cardWars = initialApplications.find((app) => app.id === "billing-poc")
  assert.ok(cardWars)
  await saveApplication({
    id: cardWars.id,
    name: "Customized Card Wars",
    description: cardWars.description,
    productionUrl: "https://billing-poc.example.test",
    preproductionUrl: cardWars.preproductionUrl,
    order: cardWars.order,
    active: cardWars.active,
  })
  await ensureApplicationSeeds()
  assert.equal(
    (await listApplications()).find((app) => app.id === "billing-poc")?.name,
    "Customized Card Wars"
  )

  const requestResults = await Promise.all(
    Array.from({ length: 8 }, () =>
      submitApplicationRequest("billing-poc", " USER@example.com ")
    )
  )
  assert.equal(requestResults.filter((result) => result.created).length, 1)
  assert.equal(
    requestResults.every((result) => result.status === "pending"),
    true
  )
  assert.deepEqual(
    await submitApplicationRequest("billing-poc", "user@example.com"),
    { created: false, status: "pending" }
  )

  const pending = (await listApplicationAdminData())
    .find((entry) => entry.app.id === "billing-poc")
    ?.requests.find((request) => request.email === "user@example.com")
  assert.ok(pending)
  const firstRequestId = pending.requestId
  assert.equal(
    await resolveApplicationRequest(
      "billing-poc",
      pending.email,
      firstRequestId,
      "reject",
      "admin@example.com"
    ),
    true
  )
  const reopened = await submitApplicationRequest("billing-poc", pending.email)
  assert.equal(reopened.created, true)
  const secondRequest = (await listApplicationAdminData())
    .find((entry) => entry.app.id === "billing-poc")
    ?.requests.find((request) => request.email === pending.email)
  assert.ok(secondRequest)
  assert.notEqual(secondRequest.requestId, firstRequestId)
  assert.equal(
    await resolveApplicationRequest(
      "billing-poc",
      pending.email,
      firstRequestId,
      "approve",
      "admin@example.com"
    ),
    false
  )
  assert.equal(
    await resolveApplicationRequest(
      "billing-poc",
      pending.email,
      secondRequest.requestId,
      "approve",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await submitApplicationRequest("billing-poc", pending.email)).status,
    "approved"
  )

  await submitApplicationRequest("dalis-home-management", pending.email)
  assert.equal(
    (await getApplicationStatus(pending.email)).get("billing-poc"),
    "approved"
  )
  assert.equal(
    (await getApplicationStatus(pending.email)).get("dalis-home-management"),
    "pending"
  )
  assert.equal(
    await changeApplicationAccess(
      "billing-poc",
      pending.email,
      "revoke",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await getApplicationStatus(pending.email)).get("billing-poc"),
    "revoked"
  )
  assert.equal(
    (await submitApplicationRequest("billing-poc", pending.email)).created,
    true
  )
  assert.equal(
    await changeApplicationAccess(
      "dalis-home-management",
      "manual@example.com",
      "grant",
      "admin@example.com"
    ),
    true
  )
  assert.equal(
    (await getApplicationStatus("manual@example.com")).get(
      "dalis-home-management"
    ),
    "approved"
  )

  assert.equal(
    await hasApplicationAccess("dalis-home-management", "manual@example.com"),
    true
  )
  assert.equal(
    await hasApplicationAccess("billing-poc", "manual@example.com"),
    false
  )
  assert.equal(await hasApplicationAccess("billing-poc", pending.email), false)
  const pocha = (await listApplications()).find(
    (entry) => entry.id === "dalis-home-management"
  )
  assert.ok(pocha)
  await saveApplication({ ...pocha, active: false })
  assert.equal(
    await hasApplicationAccess("dalis-home-management", "manual@example.com"),
    false
  )
  await saveApplication({ ...pocha, active: true })
  assert.equal(
    await hasApplicationAccess("dalis-home-management", "manual@example.com"),
    true
  )

  const productionClient = await createOidcClient({
    appId: "billing-poc",
    environment: "production",
    redirectUri: "https://billing.example.test/api/auth/callback/damaca-hub",
  })
  const intClient = await createOidcClient({
    appId: "billing-poc",
    environment: "int",
    redirectUri:
      "https://billing-git-int.example.vercel.app/api/auth/callback/damaca-hub",
  })
  assert.notEqual(productionClient.clientId, intClient.clientId)
  const storedClient = await findOidcClient(productionClient.clientId)
  assert.ok(storedClient)
  assert.equal(
    storedClient.clientSecretHash,
    hashOidcClientSecret(productionClient.clientSecret)
  )
  assert.notEqual(storedClient.clientSecretHash, productionClient.clientSecret)
  assert.equal(
    await updateOidcClient({
      appId: "billing-poc",
      environment: "production",
      clientId: productionClient.clientId,
      revision: 0,
      operation: "disable",
    }),
    null
  )
  const database = await getDatabase()
  const accessTokenCollection = database.collection("oauthAccessToken")
  await accessTokenCollection.insertOne({
    token: "test-managed-access-token",
    clientId: productionClient.clientId,
    expiresAt: new Date(Date.now() + 60_000),
  })
  const disabledClient = await updateOidcClient({
    appId: "billing-poc",
    environment: "production",
    clientId: productionClient.clientId,
    revision: 1,
    operation: "disable",
  })
  assert.deepEqual(disabledClient, { revision: 2, clientSecret: null })
  assert.equal(
    await accessTokenCollection.findOne({ token: "test-managed-access-token" }),
    null
  )
  const rotatedClient = await updateOidcClient({
    appId: "billing-poc",
    environment: "production",
    clientId: productionClient.clientId,
    revision: 2,
    operation: "rotate",
  })
  assert.ok(rotatedClient?.clientSecret)
  assert.notEqual(
    hashOidcClientSecret(rotatedClient.clientSecret),
    storedClient.clientSecretHash
  )
  assert.equal(
    (
      await updateOidcClient({
        appId: "billing-poc",
        environment: "production",
        clientId: productionClient.clientId,
        revision: 3,
        operation: "enable",
      })
    )?.revision,
    4
  )
  assert.equal(
    await updateOidcClient({
      appId: "card-wars",
      environment: "int",
      clientId: intClient.clientId,
      revision: 1,
      operation: "disable",
    }),
    null
  )
  assert.equal((await listOidcClients()).length, 2)

  const appIndexes = await database
    .collection("applications")
    .listIndexes()
    .toArray()
  const accessIndexes = await database
    .collection("app_access")
    .listIndexes()
    .toArray()
  const oidcIndexes = await database
    .collection("hub_oidc_clients")
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
  assert.equal(
    oidcIndexes.some(
      (index) =>
        index.name === "hub_oidc_app_environment_unique" && index.unique
    ),
    true
  )
  console.log(
    "Damaca Hub MongoDB integration: PASS (public apps, app-scoped requests, concurrent duplicates, stale decisions, OIDC lifecycle, token revocation, isolation, indexes)"
  )
} finally {
  if (ownsDatabase) {
    const database = await getDatabase()
    await database.dropDatabase()
  }
  await closeDatabaseConnection()
}
