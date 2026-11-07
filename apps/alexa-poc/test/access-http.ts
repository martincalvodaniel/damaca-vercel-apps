import assert from "node:assert/strict"
import { makeSignature, signJWT } from "better-auth/crypto"
import { getAuthEnv, getDatabaseEnv } from "@/config/env"
import { closeDatabaseConnection } from "@/lib/db/client"
import {
  getAccessRequestStatus,
  hasUserAccess,
  listAccessRequests,
  revokeUserAccess,
} from "@/lib/db/user-access"

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
  const now = new Date().toISOString()
  const token = crypto.randomUUID()
  const id = crypto.randomUUID()
  const jwt = await signJWT(
    {
      session: {
        id: crypto.randomUUID(),
        token,
        userId: id,
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      user: {
        id,
        name: "Fixture",
        email,
        emailVerified,
        createdAt: now,
        updatedAt: now,
      },
      updatedAt: Date.now(),
      version: "1",
    },
    configuration.secret,
    3600
  )
  return `better-auth.session_token=${encodeURIComponent(`${token}.${await makeSignature(token, configuration.secret)}`)}; better-auth.session_data=${jwt}`
}

async function request(path: string, cookie?: string, body?: FormData) {
  return fetch(`${origin}${path}`, {
    redirect: "manual",
    method: body ? "POST" : "GET",
    headers: { ...(cookie ? { cookie } : {}), origin },
    body,
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
  const admin = await createCookie("admin@example.com")
  const user = await createCookie("normal@example.com")
  const unverifiedAdmin = await createCookie("admin@example.com", false)
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
    (await request("/admin", unverifiedAdmin)).headers
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
  assert.ok(homeHtml.includes("user"))
  assert.ok(!homeHtml.includes('href="/admin"'))
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
  const unverifiedRequest = await createCookie("unverified@example.com", false)
  await request(
    "/auth/access",
    unverifiedRequest,
    actionForm(requestHtml, "unverified@example.com", "request")
  )
  assert.equal(await getAccessRequestStatus("unverified@example.com"), null)
  console.log(
    "Compiled Next access checks: PASS (roles, verified identity, real grants/revocations, self-only requests, duplicate submissions, rejection/resubmission, stale decisions, approval and access)"
  )
} finally {
  await closeDatabaseConnection()
}
