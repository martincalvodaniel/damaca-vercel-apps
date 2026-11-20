import assert from "node:assert/strict"
import { makeSignature } from "better-auth/crypto"
import { getAuthEnv, getDatabaseEnv } from "@/config/env"
import {
  createContactRecovery,
  makeRecoveryDeviceKey,
  recoverWithContacts,
  transferContactShare,
} from "@/features/recovery/contact-crypto"
import { decryptEntries, prepareVault } from "@/features/vault/crypto"
import { getAuth } from "@/lib/auth/auth"
import { closeDatabaseConnection } from "@/lib/db/client"
import { COLLECTION_NAMES } from "@/lib/db/collections"
import {
  getAccessRequestStatus,
  grantUserAccess,
  hasUserAccess,
  listAccessRequests,
  revokeUserAccess,
} from "@/lib/db/user-access"
import { localeCookie } from "@/lib/i18n/locale"
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

async function createCookie(
  email: string,
  emailVerified = true,
  existingUserId?: string
) {
  const now = new Date()
  const token = crypto.randomUUID()
  const { adapter } = await (await getAuth()).$context
  const user = existingUserId
    ? { id: existingUserId }
    : await adapter.create<{ id: string }>({
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

  for (const [cookie, language, label] of [
    [undefined, "es", "Continuar con Google"],
    [`${localeCookie}=fr`, "es", "Continuar con Google"],
    [`${localeCookie}=en`, "en", "Continue with Google"],
  ] as const) {
    const signInHtml = await (await request("/auth/signin", cookie)).text()
    assert.ok(signInHtml.includes(`<html lang="${language}"`))
    assert.ok(signInHtml.includes(label))
  }

  const admin = await createCookie("admin@example.com")
  const user = await createCookie("normal@example.com")
  const unverified = await createCookie("unverified@example.com", false)
  await revokeUserAccess("normal@example.com")
  assert.equal((await request("/admin")).status, 307)
  const adminResponse = await request("/admin", admin)
  assert.equal(adminResponse.status, 200)
  const adminHtml = await adminResponse.text()
  assert.ok(adminHtml.includes("Administración del sitio"))
  const englishAdmin = await request("/admin", `${admin}; ${localeCookie}=en`)
  assert.ok((await englishAdmin.text()).includes("Site administration"))
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
  assert.ok(homeHtml.includes("Bóveda"))
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
  const resetRequest = (
    method: "POST" | "PATCH",
    cookie: string,
    body: unknown
  ) =>
    fetch(`${origin}/api/vault`, {
      method,
      headers: { origin, cookie, "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  const startReset = await resetRequest("POST", user, "start")
  assert.equal(startReset.status, 200)
  const intent = startReset.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("damaca-vault-reset="))
    ?.split(";")[0]
  assert.ok(intent)
  assert.equal(
    (await resetRequest("POST", `${user}; ${intent}`, "claim")).status,
    403
  )
  const fresh = await createCookie(
    "normal@example.com",
    true,
    userVault.ownerId
  )
  const claim = await resetRequest("POST", `${fresh}; ${intent}`, "claim")
  assert.equal(claim.status, 200)
  const grant = claim.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("damaca-vault-reset="))
    ?.split(";")[0]
  assert.ok(grant)
  const credential = `${fresh}; ${grant}`
  const empty = await prepareVault(
    userVault.ownerId,
    "new fixture master password",
    []
  )
  const resetPayload = { revision: 1, encrypted: empty.encrypted }
  assert.equal(
    (await resetRequest("PATCH", `${user}; ${grant}`, resetPayload)).status,
    403
  )
  const results = await Promise.all([
    resetRequest("PATCH", credential, resetPayload),
    resetRequest("PATCH", credential, resetPayload),
  ])
  assert.deepEqual(
    results.map((response) => response.status).sort(),
    [200, 409]
  )
  const replaced = vaultReadSchema.parse(
    await (await request("/api/vault", user)).json()
  )
  assert.equal(replaced.generation, 1)
  assert.equal(replaced.revision, 2)
  assert.deepEqual(replaced.encrypted, empty.encrypted)
  assert.equal(
    (await writeVault(user, { revision: 1, encrypted: fixture.encrypted }))
      .status,
    409
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
  assert.ok(requestHtml.includes("Solicitar acceso"))
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
  assert.ok(rejectedHtml.includes("Tu solicitud fue rechazada."))
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
  const contactEmails = [
    "contact1@example.com",
    "contact2@example.com",
    "contact3@example.com",
  ]
  const contactSessions = await Promise.all(
    contactEmails.map(async (email) => {
      await grantUserAccess(email)
      return createCookie(email)
    })
  )
  const portal = "/api/vault/contacts"
  const callRecovery = (cookie: string, body: unknown) =>
    fetch(`${origin}${portal}`, {
      method: "POST",
      headers: { origin, cookie, "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  const originalEntry = {
    id: crypto.randomUUID(),
    title: "Recover me",
    username: "",
    password: "test value",
    notes: "",
    url: "",
  }
  const original = await prepareVault(
    adminVault.ownerId,
    "initial fixture master password",
    [originalEntry]
  )
  assert.equal(
    (await writeVault(admin, { revision: 0, encrypted: original.encrypted }))
      .status,
    200
  )
  assert.equal(
    (await callRecovery(admin, { action: "invite", emails: contactEmails }))
      .status,
    200
  )
  const pendingPolicy = (await (await request(portal, admin)).json()).policy
  const devices = await Promise.all(
    contactEmails.map(() => makeRecoveryDeviceKey())
  )
  const context = { ownerId: adminVault.ownerId, policyId: pendingPolicy.id }
  for (let index = 0; index < 3; index++) {
    const result = await callRecovery(contactSessions[index], {
      action: "accept",
      ...context,
      publicKey: devices[index].publicKey,
    })
    assert.equal(result.status, 200)
  }
  const policy = await createContactRecovery(context, original.key, [
    { id: pendingPolicy.contacts[0].id, publicKey: devices[0].publicKey },
    { id: pendingPolicy.contacts[1].id, publicKey: devices[1].publicKey },
    { id: pendingPolicy.contacts[2].id, publicKey: devices[2].publicKey },
  ])
  assert.equal(
    (
      await callRecovery(admin, {
        action: "activate",
        policyId: context.policyId,
        revision: 1,
        ...policy,
      })
    ).status,
    200
  )

  const startedRecovery = await resetRequest("POST", admin, "start-contacts")
  const recoveryIntent = startedRecovery.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("damaca-vault-reset="))
    ?.split(";")[0]
  assert.ok(recoveryIntent)
  const renewedAdmin = await createCookie(
    "admin@example.com",
    true,
    adminVault.ownerId
  )
  const claimedRecovery = await resetRequest(
    "POST",
    `${renewedAdmin}; ${recoveryIntent}`,
    "claim-contacts"
  )
  const recoveryGrant = claimedRecovery.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("damaca-vault-reset="))
    ?.split(";")[0]
  assert.ok(recoveryGrant)
  const ownerCookie = `${renewedAdmin}; ${recoveryGrant}`
  const cancelledId = crypto.randomUUID()
  const cancelledDevice = await makeRecoveryDeviceKey()
  assert.equal(
    (
      await callRecovery(ownerCookie, {
        action: "request",
        requestId: cancelledId,
        publicKey: cancelledDevice.publicKey,
      })
    ).status,
    200
  )
  assert.equal(
    (
      await callRecovery(ownerCookie, {
        action: "cancel",
        requestId: cancelledId,
      })
    ).status,
    200
  )
  assert.equal(
    (
      await callRecovery(contactSessions[0], {
        action: "approve",
        ...context,
        requestId: cancelledId,
        share: "a".repeat(512),
      })
    ).status,
    409
  )
  const receiver = await makeRecoveryDeviceKey()
  const recoveryRequest = {
    ...context,
    requestId: crypto.randomUUID(),
    publicKey: receiver.publicKey,
  }
  const requestPayload = {
    action: "request",
    requestId: recoveryRequest.requestId,
    publicKey: receiver.publicKey,
  }
  assert.equal((await callRecovery(admin, requestPayload)).status, 403)
  assert.equal((await callRecovery(ownerCookie, requestPayload)).status, 200)
  assert.equal(
    (
      await callRecovery(outsider, {
        action: "approve",
        ...context,
        requestId: recoveryRequest.requestId,
        share: "a".repeat(512),
      })
    ).status,
    403
  )
  for (let index = 0; index < 2; index++) {
    const contactId = pendingPolicy.contacts[index].id
    const share = await transferContactShare(
      recoveryRequest,
      contactId,
      policy.envelopes[index].share,
      devices[index].privateKey
    )
    const approval = {
      action: "approve",
      ...context,
      requestId: recoveryRequest.requestId,
      share,
    }
    assert.equal(
      (await callRecovery(contactSessions[index], approval)).status,
      200
    )
    assert.equal(
      (await callRecovery(contactSessions[index], approval)).status,
      409
    )
    const state = (await (await request(portal, admin)).json()).policy.request
    assert.equal(state.count, index + 1)
    assert.equal(state.approvals?.length ?? 0, index === 0 ? 0 : 2)
  }
  const completedRequest = (await (await request(portal, admin)).json()).policy
    .request
  const recovered = await recoverWithContacts(
    recoveryRequest,
    receiver.privateKey,
    completedRequest.box,
    completedRequest.approvals
  )
  const recoveredEntries = await decryptEntries(
    context.ownerId,
    recovered,
    original.encrypted.entries
  )
  assert.deepEqual(recoveredEntries, [originalEntry])
  const rotated = await prepareVault(
    context.ownerId,
    "rotated fixture master password",
    recoveredEntries
  )
  const outcome = {
    action: "complete",
    requestId: recoveryRequest.requestId,
    revision: 1,
    encrypted: rotated.encrypted,
  }
  assert.equal((await callRecovery(ownerCookie, outcome)).status, 200)
  assert.equal((await callRecovery(ownerCookie, outcome)).status, 409)
  assert.equal((await (await request(portal, admin)).json()).policy, undefined)

  console.log(
    "Compiled Next access checks: PASS (roles, verified identity, real grants/revocations, self-only requests, duplicate submissions, rejection/resubmission, stale decisions, approval and access)"
  )
} finally {
  await closeDatabaseConnection()
}
