import { afterAll, beforeAll, expect, test as it } from "bun:test"
import { createHash } from "node:crypto"
import { makeSignature } from "better-auth/crypto"
import { checkHubAccess } from "./hub-client"
import { createHubIdentity } from "./provider"
import { createConsumerIdentity } from "./server"

const hubSecret = "test-hub-session-secret-with-at-least-32-characters"
const clientSecret = "test-consumer-client-secret-with-at-least-32-characters"
const clientId = "hub_test_consumer"
let clientEnabled = true
let allowed = true
let grantUnavailable = false
let tamper: "none" | "signature" | "nonce" | "issuer" | "audience" = "none"
let hubSessionToken = ""
let hub: ReturnType<typeof createHubIdentity>
let consumer: ReturnType<typeof createConsumerIdentity>
const hubServer = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  fetch: async (request) => {
    const response = await hub.handler(request)
    if (
      tamper !== "none" &&
      new URL(request.url).pathname === "/api/auth/oauth2/token" &&
      response.ok
    ) {
      const token = (await response.json()) as { id_token: string }
      if (tamper === "signature")
        token.id_token = `${token.id_token.slice(0, -10)}AAAAAAAAAA`
      else {
        const payload = JSON.parse(
          Buffer.from(token.id_token.split(".")[1], "base64url").toString()
        ) as Record<string, unknown>
        if (tamper === "nonce") payload.nonce = "wrong-nonce"
        if (tamper === "issuer")
          payload.iss = "https://wrong-issuer.invalid/api/auth"
        if (tamper === "audience") payload.aud = "another-consumer"
        token.id_token = (await hub.api.signJWT({ body: { payload } })).token
      }
      return Response.json(token)
    }
    return response
  },
})
const consumerServer = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  fetch: (request) => consumer.auth.handler(request),
})
const hubUrl = hubServer.url.origin
const consumerUrl = consumerServer.url.origin
let hubCookie = ""
let consumerCookie = ""
let accessToken = ""
let originalCode = ""
let existingConsumerUserId = ""
const configuration = {
  appId: "test-application",
  hubUrl,
  clientId,
  clientSecret,
}

function cookies(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ")
}

beforeAll(async () => {
  hub = createHubIdentity({
    baseUrl: hubUrl,
    secret: hubSecret,
    googleClientId: "test-google-id",
    googleClientSecret: "test-google-secret",
    database: undefined,
    resolveClient: async (id) =>
      id === clientId
        ? {
            appId: configuration.appId,
            clientId,
            clientSecretHash: createHash("sha256")
              .update(clientSecret)
              .digest("base64url"),
            redirectUri: `${consumerUrl}/api/auth/callback/damaca-hub`,
            enabled: clientEnabled,
          }
        : null,
    isAllowed: async (appId, email) => {
      if (grantUnavailable) throw new Error("Test grant service unavailable")
      return (
        allowed &&
        appId === "test-application" &&
        email === "player@example.com"
      )
    },
  })
  consumer = createConsumerIdentity({
    ...configuration,
    baseUrl: consumerUrl,
    secret: "test-consumer-session-secret-with-at-least-32-characters",
  })
  const consumerContext = await consumer.auth.$context
  const localUser = await consumerContext.adapter.create<{ id: string }>({
    model: "user",
    data: {
      name: "Existing local account",
      email: "player@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  existingConsumerUserId = localUser.id
  await consumerContext.adapter.create({
    model: "account",
    data: {
      accountId: "legacy-google-account",
      providerId: "google",
      userId: localUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  const context = await hub.$context
  const user = await context.adapter.create<{ id: string }>({
    model: "user",
    data: {
      name: "Test Player",
      email: "player@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  const session = await context.internalAdapter.createSession(user.id)
  hubSessionToken = session.token
  hubCookie = `${context.authCookies.sessionToken.name}=${encodeURIComponent(`${session.token}.${await makeSignature(session.token, hubSecret)}`)}`
})

afterAll(() => {
  hubServer.stop(true)
  consumerServer.stop(true)
})

it("central Hub authenticates an OIDC consumer and checks current app grants", async () => {
  const start = await fetch(`${consumerUrl}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: consumerUrl },
    body: JSON.stringify({
      provider: "damaca-hub",
      callbackURL: "/",
      disableRedirect: true,
    }),
    redirect: "manual",
  })
  expect(start.status).toBe(200)
  const data = (await start.json()) as { url: string }
  expect(new URL(data.url).origin).toBe(hubUrl)
  expect(new URL(data.url).searchParams.get("code_challenge_method")).toBe(
    "S256"
  )
  expect(new URL(data.url).searchParams.get("nonce")).toBeTruthy()
  const authorized = await fetch(data.url, {
    headers: { Cookie: hubCookie, Accept: "text/html" },
    redirect: "manual",
  })
  expect(authorized.status).toBe(302)
  const callback = authorized.headers.get("location") ?? ""
  expect(new URL(callback).origin).toBe(consumerUrl)
  originalCode = new URL(callback).searchParams.get("code") ?? ""
  expect(originalCode).toBeTruthy()
  const signedIn = await fetch(callback, {
    headers: { Cookie: cookies(start) },
    redirect: "manual",
  })
  expect(signedIn.status).toBe(302)
  expect(signedIn.headers.get("location")).not.toContain("error=")
  consumerCookie = cookies(signedIn)
  const session = await consumer.auth.api.getSession({
    headers: new Headers({ Cookie: consumerCookie }),
  })
  expect(session?.user.id).toBe(existingConsumerUserId)
  expect(session?.user.email).toBe("player@example.com")
  expect(session?.user.emailVerified).toBe(true)
  const linked = await (
    await consumer.auth.$context
  ).internalAdapter.findUserByEmail("player@example.com")
  expect(linked?.user.id).toBe(existingConsumerUserId)
  const token = await consumer.auth.api.getAccessToken({
    headers: new Headers({ Cookie: consumerCookie }),
    body: { useAccountCookie: true },
  })
  accessToken = token.accessToken
  const refreshed = await consumer.auth.api.refreshToken({
    headers: new Headers({ Cookie: consumerCookie }),
    body: { useAccountCookie: true },
    asResponse: true,
  })
  expect(refreshed.ok).toBe(true)
  const refreshedBody = (await refreshed.json()) as { accessToken: string }
  accessToken = refreshedBody.accessToken
  expect(accessToken).toBeTruthy()
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("approved")
  clientEnabled = false
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("denied")
  clientEnabled = true
  allowed = false
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("denied")
  allowed = true
  expect(
    await checkHubAccess(
      { ...configuration, appId: "another-application" },
      accessToken,
      "player@example.com"
    )
  ).toBe("denied")
  expect(
    await checkHubAccess(configuration, accessToken, "another@example.com")
  ).toBe("denied")
  expect(
    await checkHubAccess(configuration, "invalid-token", "player@example.com")
  ).toBe("denied")
})

it("keeps account-token reads server-only and separate from renewal", async () => {
  const account = await consumer.auth.api.readHubAccount({
    headers: new Headers({ Cookie: consumerCookie }),
  })
  expect(account?.providerId).toBe("damaca-hub")
  expect(account?.accessToken).toBeTruthy()
  const response = await fetch(`${consumerUrl}/api/auth/damaca/read-account`, {
    headers: { Cookie: consumerCookie },
    redirect: "manual",
  })
  expect(response.status).toBe(404)
  expect(await response.text()).not.toContain(accessToken)
  for (const path of ["get-access-token", "refresh-token"]) {
    const blocked = await fetch(`${consumerUrl}/api/auth/${path}`, {
      method: "POST",
      headers: {
        Cookie: consumerCookie,
        Origin: consumerUrl,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ useAccountCookie: true }),
    })
    expect(blocked.status).toBe(404)
  }
})

it("denies access when the current grant cannot be read", async () => {
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("approved")
  grantUnavailable = true
  try {
    expect(
      await checkHubAccess(configuration, accessToken, "player@example.com")
    ).toBe("unavailable")
  } finally {
    grantUnavailable = false
  }
})

it("rejects authorization codes reused after exchange", async () => {
  const response = await fetch(`${hubUrl}/api/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${configuration.clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: originalCode,
      redirect_uri: `${consumerUrl}/api/auth/callback/damaca-hub`,
      code_verifier: "invalid-verifier-that-is-long-enough-for-the-protocol",
    }),
  })
  expect(response.ok).toBe(false)
})

it("rejects unknown clients and unregistered callback URLs", async () => {
  for (const [clientId, redirectUri] of [
    ["unknown-client", "https://attacker.invalid/callback"],
    [configuration.clientId, "https://attacker.invalid/callback"],
  ]) {
    const url = new URL("/api/auth/oauth2/authorize", hubUrl)
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: "state",
    }).toString()
    const response = await fetch(url, {
      headers: { Cookie: hubCookie },
      redirect: "manual",
    })
    expect(response.headers.get("location") ?? "").not.toStartWith(
      "https://attacker.invalid"
    )
    expect(
      response.status >= 400 ||
        (response.headers.get("location") ?? "").includes("error=")
    ).toBe(true)
  }
})

it("rejects an OAuth callback without its state cookie", async () => {
  const response = await fetch(
    `${consumerUrl}/api/auth/callback/damaca-hub?code=forged&state=forged`,
    { redirect: "manual" }
  )
  expect(response.headers.get("location") ?? "").toContain("error=")
  expect(cookies(response)).not.toContain("session_data=")
})

async function authorizeConsumer() {
  const start = await fetch(`${consumerUrl}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: consumerUrl },
    body: JSON.stringify({
      provider: "damaca-hub",
      callbackURL: "/",
      disableRedirect: true,
    }),
    redirect: "manual",
  })
  const data = (await start.json()) as { url: string }
  const response = await fetch(data.url, {
    headers: { Cookie: hubCookie, Accept: "text/html" },
    redirect: "manual",
  })
  return {
    start,
    callback: response.headers.get("location") ?? "",
    authorizationUrl: data.url,
  }
}

it("rejects invalid signatures and signed nonce, issuer or audience mismatches", async () => {
  for (const mode of ["signature", "nonce", "issuer", "audience"] as const) {
    const flow = await authorizeConsumer()
    tamper = mode
    try {
      const response = await fetch(flow.callback, {
        headers: { Cookie: cookies(flow.start) },
        redirect: "manual",
      })
      expect(response.headers.get("location") ?? "").toContain("error=")
      expect(cookies(response)).not.toContain("session_data=")
    } finally {
      tamper = "none"
    }
  }
})

it("rejects token exchange with a wrong client secret or PKCE verifier", async () => {
  for (const secret of [
    "incorrect-client-secret-at-least-32-characters",
    clientSecret,
  ]) {
    const flow = await authorizeConsumer()
    const code = new URL(flow.callback).searchParams.get("code") ?? ""
    const response = await fetch(`${hubUrl}/api/auth/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${configuration.clientId}:${secret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${consumerUrl}/api/auth/callback/damaca-hub`,
        code_verifier: "incorrect-verifier-with-at-least-43-characters",
      }),
    })
    expect(response.ok).toBe(false)
  }
})

it("rotates Hub signing keys while publishing previous keys during the grace period", async () => {
  const context = await hub.$context
  const existing = await context.adapter.findMany<{ id: string }>({
    model: "jwks",
  })
  for (const key of existing)
    await context.adapter.update({
      model: "jwks",
      where: [{ field: "id", value: key.id }],
      update: { expiresAt: new Date(Date.now() - 1000) },
    })
  await hub.api.signJWT({ body: { payload: { sub: "rotation-test" } } })
  const keys = (await (await fetch(`${hubUrl}/api/auth/jwks`)).json()) as {
    keys: unknown[]
  }
  expect(keys.keys.length).toBeGreaterThan(existing.length)
  // A fresh consumer loads the rotated JWKS; existing JOSE caches retry unknown keys after their 30-second cooldown.
  consumer = createConsumerIdentity({
    ...configuration,
    baseUrl: consumerUrl,
    secret: "test-consumer-session-secret-with-at-least-32-characters",
  })
  const flow = await authorizeConsumer()
  const response = await fetch(flow.callback, {
    headers: { Cookie: cookies(flow.start) },
    redirect: "manual",
  })
  expect(response.headers.get("location")).not.toContain("error=")
  expect(cookies(response)).toContain("session_data=")
  accessToken = (
    await consumer.auth.api.getAccessToken({
      headers: new Headers({ Cookie: cookies(response) }),
      body: { useAccountCookie: true },
    })
  ).accessToken
})

it("denies access after its originating Hub session is removed", async () => {
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("approved")
  await (await hub.$context).internalAdapter.deleteSession(hubSessionToken)
  expect(
    await checkHubAccess(configuration, accessToken, "player@example.com")
  ).toBe("denied")
})
