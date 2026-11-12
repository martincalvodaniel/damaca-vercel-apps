import assert from "node:assert/strict"
import { makeSignature } from "better-auth/crypto"
import { getAuthEnv, getDatabaseEnv } from "@/config/env"
import { prepareVault } from "@/features/vault/crypto"
import { getAuth } from "@/lib/auth/auth"
import { closeDatabaseConnection } from "@/lib/db/client"
import { COLLECTION_NAMES } from "@/lib/db/collections"
import {
  getAccessRequestStatus,
  hasUserAccess,
  listAccessRequests,
  revokeUserAccess,
} from "@/lib/db/user-access"
import { vaultReadSchema } from "@/schemas/vault"

const configuration = getAuthEnv()
const database = getDatabaseEnv()
const origin = configuration.baseUrl
if (
  !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
  !/^template_access_test_[a-z0-9_]+$/.test(database.databaseName) ||
  !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(database.uri) ||
  configuration.allowedEmails !== "admin@example.com"
) {
  throw new Error(
    "HTTP access checks require an isolated loopback application and fixture administrator"
  )
}

async function createCookie(email: string, emailVerified = true) {
  const now = new Date()
  const token = crypto.randomUUID()
  const { adapter } = await (await getAuth()).$context
  const user = await adapter.create<{ id: string }>({
    model: COLLECTION_NAMES.authUsers,
    data: {
      name: "Fixture",
      email,
      emailVerified,
      createdAt: now,
      updatedAt: now,
    },
  })
  await adapter.create({
    model: COLLECTION_NAMES.authSessions,
    data: {
      token,
      userId: user.id,
      createdAt: now,
      updatedAt: now,
      expiresAt: new Date(Date.now() + 3600000),
    },
  })
  return `better-auth.session_token=${encodeURIComponent(`${token}.${await makeSignature(token, configuration.secret)}`)}`
}

async function request(path: string, cookie?: string, body?: FormData) {
  return fetch(`${origin}${path}`, {
    redirect: "manual",
    method: body ? "POST" : "GET",
    headers: { ...(cookie ? { cookie } : {}), origin },
    body,
  })
}

async function writeVault(
  cookie: string,
  body: unknown,
  requestOrigin = origin
) {
  return fetch(`${origin}/api/vault`, {
    method: "PUT",
    headers: {
      cookie,
      origin: requestOrigin,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
}

function actionForm(
  html: string,
  email: string,
  operation: string,
  requestId?: string
) {
  const forms = Array.from(
    html.matchAll(/<form[\s\S]*?<\/form>/g),
    (match) => match[0]
  )
  const form = forms.find((candidate) =>
    requestId
      ? candidate.includes(requestId)
      : candidate.includes(
          `value="${operation === "revoke" ? "grant" : operation}"`
        )
  )
  assert.ok(
    form,
    `Rendered form required for ${operation}; request ID supplied: ${Boolean(requestId)}; forms: ${forms.length}`
  )
  const data = new FormData()
  for (const input of form.matchAll(/<input[^>]*>/g)) {
    const name = input[0].match(/name="([^"]+)"/)?.[1]
    const value = input[0].match(/value="([^"]*)"/)?.[1] ?? ""
    if (name?.startsWith("$ACTION"))
      data.append(decodeHtml(name), decodeHtml(value))
  }
  assert.ok(
    [...data.keys()].length > 0,
    "Rendered Server Action metadata is required"
  )
  data.set("email", email)
  if (requestId) {
    data.set("decision", operation)
    data.set("requestId", requestId)
  } else data.set("operation", operation)
  return data
}

try {
  const signIn = await fetch(`${origin}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      provider: "google",
      callbackURL: "/",
      disableRedirect: true,
    }),
  })
  assert.equal(signIn.status, 200)
  const authorization = new URL((await signIn.json()).url)
  assert.equal(authorization.origin, "https://accounts.google.com")
  assert.equal(
    authorization.searchParams.get("redirect_uri"),
    `${origin}/api/auth/callback/google`
  )
  assert.ok(authorization.searchParams.get("state"))
  assert.equal(authorization.searchParams.get("code_challenge_method"), "S256")

  const admin = await createCookie("admin@example.com")
  const user = await createCookie("normal@example.com")
  const unverified = await createCookie("unverified@example.com", false)
  await revokeUserAccess("normal@example.com")
  assert.equal((await request("/admin")).status, 307)
  const adminResponse = await request("/admin", admin)
  assert.equal(adminResponse.status, 200)
  const adminHtml = await adminResponse.text()
  assert.ok(adminHtml.includes("Site administration"))
  const adminSettings = await request("/settings", admin)
  assert.equal(adminSettings.status, 200)
  const adminSettingsHtml = await adminSettings.text()
  assert.ok(adminSettingsHtml.includes("admin@example.com"))
  assert.ok(adminSettingsHtml.includes('href="/admin"'))
  assert.ok(adminSettingsHtml.includes('aria-current="page"'))
  assert.equal((await request("/settings")).status, 307)
  assert.ok(
    (await request("/admin", unverified)).headers
      .get("location")
      ?.includes("/auth/signin")
  )
  assert.ok(
    (await request("/", user)).headers.get("location")?.includes("/auth/access")
  )
  await request(
    "/admin",
    admin,
    actionForm(adminHtml, " NORMAL@example.com ", "grant")
  )
  assert.equal(await hasUserAccess("normal@example.com"), true)
  const home = await request("/", user)
  assert.equal(home.status, 200)
  const homeHtml = await home.text()
  assert.ok(homeHtml.includes("Vault"))
  assert.ok(!homeHtml.includes('href="/admin"'))
  assert.equal((await request("/api/vault")).status, 401)
  const userVault = vaultReadSchema.parse(
    await (await request("/api/vault", user)).json()
  )
  assert.equal(userVault.revision, 0)
  const fixture = await prepareVault(
    userVault.ownerId,
    "fixture master password",
    []
  )
  assert.equal(
    (
      await writeVault(
        user,
        { revision: 0, encrypted: fixture.encrypted },
        "https://example.test"
      )
    ).status,
    403
  )
  assert.equal(
    (
      await writeVault(user, {
        revision: 0,
        encrypted: fixture.encrypted,
        ownerId: "forged",
      })
    ).status,
    400
  )
  const writes = await Promise.all([
    writeVault(user, { revision: 0, encrypted: fixture.encrypted }),
    writeVault(user, { revision: 0, encrypted: fixture.encrypted }),
  ])
  assert.deepEqual(writes.map((response) => response.status).sort(), [200, 409])
  const stored = await request("/api/vault", user)
  assert.equal(stored.headers.get("cache-control"), "no-store")
  assert.deepEqual(
    vaultReadSchema.parse(await stored.json()).encrypted,
    fixture.encrypted
  )
  const adminVault = vaultReadSchema.parse(
    await (await request("/api/vault", admin)).json()
  )
  assert.notEqual(adminVault.ownerId, userVault.ownerId)
  assert.equal(adminVault.encrypted, null)
  assert.equal(
    (await writeVault(admin, { revision: 1, encrypted: fixture.encrypted }))
      .status,
    409
  )
  const userSettings = await request("/settings", user)
  assert.equal(userSettings.status, 200)
  const userSettingsHtml = await userSettings.text()
  assert.ok(userSettingsHtml.includes("normal@example.com"))
  assert.ok(!userSettingsHtml.includes('href="/admin"'))
  assert.equal((await request("/admin", user)).headers.get("location"), "/")
  await request(
    "/admin",
    user,
    actionForm(adminHtml, "attacker@example.com", "grant")
  )
  assert.equal(await hasUserAccess("attacker@example.com"), false)
  await request(
    "/admin",
    admin,
    actionForm(adminHtml, "admin@example.com", "revoke")
  )
  assert.equal((await request("/admin", admin)).status, 200)
  await request(
    "/admin",
    admin,
    actionForm(adminHtml, "normal@example.com", "revoke")
  )
  assert.equal(await hasUserAccess("normal@example.com"), false)
  assert.ok(
    (await request("/", user)).headers.get("location")?.includes("/auth/access")
  )
  assert.ok(
    (await request("/admin", user)).headers
      .get("location")
      ?.includes("/auth/access")
  )
  assert.equal((await request("/api/vault", user)).status, 403)
  assert.equal(
    (await writeVault(user, { revision: 1, encrypted: fixture.encrypted }))
      .status,
    403
  )
  const outsider = await createCookie("requester@example.com")
  const requestResponse = await request("/auth/access", outsider)
  assert.equal(requestResponse.status, 200)
  const requestHtml = await requestResponse.text()
  assert.ok(requestHtml.includes("Request access"))
  assert.ok(
    (await request("/auth/signin", outsider)).headers
      .get("location")
      ?.includes("/auth/access")
  )
  const forgedRequest = actionForm(requestHtml, "victim@example.com", "request")
  await request("/auth/access", outsider, forgedRequest)
  assert.equal(await getAccessRequestStatus("victim@example.com"), null)
  assert.equal(await getAccessRequestStatus("requester@example.com"), "pending")
  assert.equal(await hasUserAccess("requester@example.com"), false)
  const firstRequest = (await listAccessRequests()).entries.find(
    (entry) => entry.email === "requester@example.com"
  )
  assert.ok(firstRequest)
  await request(
    "/auth/access",
    outsider,
    actionForm(requestHtml, "ignored@example.com", "request")
  )
  assert.equal(
    (await listAccessRequests()).entries.find(
      (entry) => entry.email === "requester@example.com"
    )?.requestId,
    firstRequest.requestId
  )
  const reviewHtml = await (await request("/admin", admin)).text()
  await request(
    "/admin",
    user,
    actionForm(
      reviewHtml,
      firstRequest.email,
      "approve",
      firstRequest.requestId
    )
  )
  assert.equal(await hasUserAccess(firstRequest.email), false)
  await request(
    "/admin",
    admin,
    actionForm(reviewHtml, firstRequest.email, "reject", firstRequest.requestId)
  )
  assert.equal(await getAccessRequestStatus(firstRequest.email), "rejected")
  const rejectedHtml = await (await request("/auth/access", outsider)).text()
  assert.ok(rejectedHtml.includes("rejected"))
  await request(
    "/auth/access",
    outsider,
    actionForm(rejectedHtml, firstRequest.email, "request")
  )
  const secondRequest = (await listAccessRequests()).entries.find(
    (entry) => entry.email === firstRequest.email
  )
  assert.ok(secondRequest)
  assert.notEqual(secondRequest.requestId, firstRequest.requestId)
  await request(
    "/admin",
    admin,
    actionForm(
      reviewHtml,
      firstRequest.email,
      "approve",
      firstRequest.requestId
    )
  )
  assert.equal(await hasUserAccess(firstRequest.email), false)
  const refreshedReview = await (await request("/admin", admin)).text()
  await request(
    "/admin",
    admin,
    actionForm(
      refreshedReview,
      secondRequest.email,
      "approve",
      secondRequest.requestId
    )
  )
  assert.equal(await hasUserAccess(secondRequest.email), true)
  assert.equal((await request("/", outsider)).status, 200)
  assert.equal(
    (await request("/auth/access", outsider)).headers.get("location"),
    "/"
  )
  assert.equal(
    (await listAccessRequests()).entries.some(
      (entry) => entry.email === secondRequest.email
    ),
    false
  )
  await request(
    "/auth/access",
    unverified,
    actionForm(requestHtml, "unverified@example.com", "request")
  )
  assert.equal(await getAccessRequestStatus("unverified@example.com"), null)
  console.log(
    "Compiled Next access checks: PASS (roles, verified identity, real grants/revocations, self-only requests, duplicate submissions, rejection/resubmission, stale decisions, approval and access)"
  )
} finally {
  await closeDatabaseConnection()
}
