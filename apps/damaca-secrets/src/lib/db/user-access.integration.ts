import "server-only"

import assert from "node:assert/strict"
import { getDatabaseEnv } from "@/config/env"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import {
  getAccessRequestStatus,
  grantUserAccess,
  hasUserAccess,
  listAccessRequests,
  listUserAccess,
  resolveAccessRequest,
  revokeUserAccess,
  submitAccessRequest,
} from "@/lib/db/user-access"

// Run explicitly with --no-env-file and a disposable loopback database.
const configuration = getDatabaseEnv()
if (
  !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(configuration.uri) ||
  !/^template_access_test_[a-z0-9_]+$/.test(configuration.databaseName)
) {
  throw new Error(
    "Access integration requires a disposable template_access_test_* database on loopback"
  )
}

try {
  assert.equal(await hasUserAccess("user@example.com"), false)
  await Promise.all(
    Array.from({ length: 8 }, () => grantUserAccess(" USER@example.com "))
  )
  assert.equal(await hasUserAccess("user@example.com"), true)
  assert.equal((await listUserAccess()).entries.length, 1)
  await closeDatabaseConnection()
  assert.equal(await hasUserAccess("user@example.com"), true)
  await revokeUserAccess(" User@example.com ")
  assert.equal(await hasUserAccess("user@example.com"), false)
  await revokeUserAccess("user@example.com")
  await Promise.all(
    Array.from({ length: 53 }, (_, index) =>
      grantUserAccess(`user${String(index).padStart(3, "0")}@example.com`)
    )
  )
  const first = await listUserAccess()
  assert.equal(first.entries.length, 50)
  assert.notEqual(first.nextCursor, null)
  const last = await listUserAccess(first.nextCursor ?? undefined)
  assert.equal(last.entries.length, 3)
  assert.equal(last.nextCursor, null)
  assert.equal(
    new Set([...first.entries, ...last.entries].map((entry) => entry.email))
      .size,
    53
  )
  const database = await getDatabase()
  const indexes = await database
    .collection("user_access")
    .listIndexes()
    .toArray()
  assert.equal(
    indexes.some(
      (index) => index.name === "email_unique" && index.unique === true
    ),
    true
  )
  await database
    .collection("user_access")
    .insertOne({ email: "legacy@example.com", createdAt: new Date() })
  assert.equal(await hasUserAccess("legacy@example.com"), true)
  await Promise.all(
    Array.from({ length: 8 }, () =>
      submitAccessRequest(" Requester@example.com ")
    )
  )
  const pending = (await listAccessRequests()).entries
  assert.equal(pending.length, 1)
  const firstId = pending[0].requestId
  assert.equal(await hasUserAccess("requester@example.com"), false)
  assert.equal(await getAccessRequestStatus("requester@example.com"), "pending")
  await submitAccessRequest("requester@example.com")
  assert.equal((await listAccessRequests()).entries[0].requestId, firstId)
  assert.equal(
    await resolveAccessRequest("requester@example.com", firstId, "reject"),
    true
  )
  assert.equal(await hasUserAccess("requester@example.com"), false)
  await submitAccessRequest("requester@example.com")
  const secondId = (await listAccessRequests()).entries[0].requestId
  assert.notEqual(firstId, secondId)
  assert.equal(
    await resolveAccessRequest("requester@example.com", firstId, "approve"),
    false
  )
  assert.equal(
    await resolveAccessRequest("requester@example.com", secondId, "approve"),
    true
  )
  assert.equal(await hasUserAccess("requester@example.com"), true)
  assert.equal((await listAccessRequests()).entries.length, 0)
  await submitAccessRequest("race@example.com")
  const raceId = (await listAccessRequests()).entries[0].requestId
  const outcomes = await Promise.all([
    resolveAccessRequest("race@example.com", raceId, "approve"),
    resolveAccessRequest("race@example.com", raceId, "reject"),
  ])
  assert.equal(outcomes.filter(Boolean).length, 1)
  assert.equal(
    await hasUserAccess("race@example.com"),
    (await getAccessRequestStatus("race@example.com")) === "approved"
  )
  await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      const email = `concurrent${index}@example.com`
      await Promise.all([submitAccessRequest(email), grantUserAccess(email)])
      assert.equal(await hasUserAccess(email), true)
    })
  )
  await submitAccessRequest("revoked@example.com")
  const revokedId = (await listAccessRequests()).entries[0].requestId
  await revokeUserAccess("revoked@example.com")
  await submitAccessRequest("revoked@example.com")
  assert.equal(
    await resolveAccessRequest("revoked@example.com", revokedId, "approve"),
    false
  )
  await grantUserAccess("revoked@example.com")
  await Promise.all(
    Array.from({ length: 53 }, (_, index) =>
      submitAccessRequest(
        `pending${String(index).padStart(3, "0")}@example.com`
      )
    )
  )
  const requestsFirst = await listAccessRequests()
  const requestsLast = await listAccessRequests(
    requestsFirst.nextCursor ?? undefined
  )
  assert.equal(requestsFirst.entries.length, 50)
  assert.equal(requestsLast.entries.length, 3)
  assert.equal(requestsLast.nextCursor, null)
  assert.equal(
    (await listUserAccess()).entries.some((entry) =>
      entry.email.startsWith("pending")
    ),
    false
  )
  console.log(
    "MongoDB access integration: PASS (grants, legacy permissions, idempotent requests, atomic review races, stale decisions, pagination, unique index)"
  )
} finally {
  await closeDatabaseConnection()
}
