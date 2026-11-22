import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { makeSignature } from "better-auth/crypto"
import { getAuthEnv, getDatabaseEnv } from "@/config/env"
import { getMcpAuth } from "@/lib/auth/mcp-auth"
import { getMcpClients, getMcpUrls } from "@/lib/auth/mcp-config"
import { closeDatabaseConnection } from "@/lib/db/client"
import { createDish } from "@/lib/db/dishes"
import { setWeeklyMealSlot } from "@/lib/db/weekly-meal-plans"

const { origin, issuer, resource, metadata } = getMcpUrls()
const { databaseName, uri } = getDatabaseEnv()
const [client] = getMcpClients()
assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/)
assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:\d+\/\?directConnection=true$/)
assert.match(databaseName, /^dalis_mcp_test_\d+$/)
assert.equal(client?.id, "dalis-test")
assert.equal(client.redirectUri, "https://example.com/oauth/callback")
assert.equal(getAuthEnv().allowedEmails, "allowed@example.com")

async function beginAuthorization(cookie: string, scope: string) {
  const verifier = crypto.randomUUID() + crypto.randomUUID()
  const url = new URL(`${issuer}/oauth2/authorize`)
  url.search = new URLSearchParams({
    client_id: client.id,
    redirect_uri: client.redirectUri,
    response_type: "code",
    state: "fixture-state",
    scope,
    resource,
    prompt: "consent",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  }).toString()

  const login = await fetch(url, { redirect: "manual" })
  assert.equal(
    new URL(login.headers.get("location") ?? "", origin).pathname,
    "/connect/mcp/sign-in"
  )

  const response = await fetch(url, { headers: { cookie }, redirect: "manual" })
  assert.equal(response.status, 302)
  const consent = new URL(response.headers.get("location") ?? "", origin)
  assert.equal(consent.pathname, "/connect/mcp/consent")
  const page = await fetch(consent, { headers: { cookie } })
  assert.equal(page.status, 200)
  assert.match(await page.text(), /podrá consultar la comida y la cena/)
  return { consent, verifier }
}

async function decide(consent: URL, cookie: string, accept: boolean) {
  const response = await fetch(`${issuer}/oauth2/consent`, {
    method: "POST",
    headers: { origin, cookie, "content-type": "application/json" },
    body: JSON.stringify({ accept, oauth_query: consent.search.slice(1) }),
  })
  const result = await response.json()
  assert.equal(response.status, 200, JSON.stringify(result))
  const redirect = new URL(result.url)
  assert.equal(redirect.origin + redirect.pathname, client.redirectUri)
  assert.equal(redirect.searchParams.get("state"), "fixture-state")
  return redirect
}

async function exchange(params: Record<string, string>) {
  const response = await fetch(`${issuer}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: client.id,
      client_secret: client.secret,
      resource,
    }),
  })
  const tokens = await response.json()
  assert.equal(response.status, 200, tokens.error_description)
  assert.equal(typeof tokens.access_token, "string")
  return {
    accessToken: String(tokens.access_token),
    refreshToken: tokens.refresh_token as string | undefined,
  }
}

async function requestMcp(token?: string) {
  return fetch(resource, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(token && { authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  })
}

try {
  const denied = await requestMcp()
  assert.equal(denied.status, 401)
  assert.match(denied.headers.get("www-authenticate") ?? "", /menu:read/)
  assert.equal(denied.headers.get("cache-control"), "no-store")
  assert.equal((await requestMcp("invalid-token")).status, 401)
  const protectedResource = await fetch(metadata)
  assert.equal(protectedResource.status, 200)
  assert.deepEqual((await protectedResource.json()).authorization_servers, [
    issuer,
  ])
  const authorizationServer = await fetch(
    `${origin}/.well-known/oauth-authorization-server/api/mcp-auth`
  )
  assert.equal(authorizationServer.status, 200)
  assert.equal((await authorizationServer.json()).issuer, issuer)
  assert.equal((await fetch(`${origin}/auth/signin`)).status, 200)
  const webGoogle = await fetch(`${origin}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ provider: "google", disableRedirect: true }),
  })
  assert.equal(webGoogle.status, 200)
  assert.equal(
    new URL((await webGoogle.json()).url).searchParams.get("redirect_uri"),
    `${origin}/api/auth/callback/google`
  )

  const auth = await getMcpAuth()
  const { internalAdapter, authCookies } = await auth.$context
  const user = await internalAdapter.createUser(
    { email: "allowed@example.com", emailVerified: true, name: "Fixture" },
    { method: "test" }
  )
  const session = await internalAdapter.createSession(user.id, false)
  assert.ok(session)
  const signature = await makeSignature(session.token, getAuthEnv().secret)
  const cookie = `${authCookies.sessionToken.name}=${encodeURIComponent(`${session.token}.${signature}`)}`

  const claims = {
    sub: user.id,
    aud: resource,
    exp: Math.floor(Date.now() / 1000) + 300,
    client_id: client.id,
    scope: "menu:read",
  }
  for (const invalidClaims of [
    { aud: `${origin}/wrong-resource` },
    { scope: "offline_access" },
    { client_id: "unregistered-client" },
    { exp: Math.floor(Date.now() / 1000) - 60 },
  ]) {
    const { token } = await auth.api.signJWT({
      body: { payload: { ...claims, ...invalidClaims } },
    })
    assert.equal((await requestMcp(token)).status, 401)
  }

  const refused = await beginAuthorization(cookie, "menu:read offline_access")
  const refusal = await decide(refused.consent, cookie, false)
  assert.equal(refusal.searchParams.get("error"), "access_denied")
  const { consent, verifier } = await beginAuthorization(
    cookie,
    "menu:read offline_access"
  )
  const code = (await decide(consent, cookie, true)).searchParams.get("code")
  assert.ok(code)
  const { accessToken, refreshToken } = await exchange({
    grant_type: "authorization_code",
    code,
    redirect_uri: client.redirectUri,
    code_verifier: verifier,
  })
  assert.ok(refreshToken)
  const refreshed = await exchange({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  })
  assert.equal((await requestMcp(refreshed.accessToken)).status, 200)

  const dishId = await createDish({
    name: "Lentejas de prueba",
    ingredients: [],
    notes: "",
  })
  await setWeeklyMealSlot({
    date: "2024-12-30",
    weekStart: "2024-12-30",
    mealType: "lunch",
    dishId,
  })

  const mcp = new Client({ name: "dalis-menu-test", version: "1.0.0" })
  await mcp.connect(
    new StreamableHTTPClientTransport(new URL(resource), {
      requestInit: { headers: { authorization: `Bearer ${accessToken}` } },
    })
  )
  try {
    const { tools } = await mcp.listTools()
    assert.deepEqual(
      tools.map(({ name }) => name),
      ["get_menu"]
    )
    assert.equal(tools[0]?.annotations?.readOnlyHint, true)
    assert.deepEqual(
      Object.keys(tools[0]?.inputSchema.properties ?? {}).sort(),
      ["date", "period", "weekOf"]
    )
    const actual = await mcp.callTool({
      name: "get_menu",
      arguments: { weekOf: "2025-01-01" },
    })
    assert.notEqual(actual.isError, true)
    assert.match(JSON.stringify(actual.structuredContent), /Lentejas de prueba/)
    assert.match(JSON.stringify(actual.content), /Comida: Lentejas de prueba/)
    const invalid = await mcp.callTool({
      name: "get_menu",
      arguments: { date: "2025-01-01", period: "today" },
    })
    assert.equal(invalid.isError, true)
  } finally {
    await mcp.close()
  }

  await internalAdapter.updateUser(user.id, { email: "removed@example.com" })
  assert.equal((await requestMcp(accessToken)).status, 403)
  console.log(
    "OAuth discovery, consent, refresh, MCP connection, menu, and access recheck passed"
  )
} finally {
  await closeDatabaseConnection()
}
