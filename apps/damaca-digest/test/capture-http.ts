import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { getAuthEnv, getChatGptClient, getDatabaseEnv } from "@/config/env"
import { captureScope, getMcpUrls } from "@/lib/auth/mcp-config"
import { closeDatabaseConnection } from "@/lib/db/client"
import { grantUserAccess, revokeUserAccess } from "@/lib/db/user-access"
import { createFixtureSession } from "./session-fixture"

const { baseUrl: origin, allowedEmails } = getAuthEnv()
const database = getDatabaseEnv()
const client = getChatGptClient()
if (
  !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
  !/^digest_capture_test_[a-z\d_]+$/.test(database.databaseName) ||
  !/^mongodb:\/\/127\.0\.0\.1:\d+\/?$/.test(database.uri) ||
  allowedEmails !== "admin@example.com" ||
  client?.id !== "digest-test" ||
  client.redirectUri !== "https://chatgpt.com/connector/oauth/test"
) {
  throw new Error(
    "Capture checks require an isolated loopback application and fixture OAuth client"
  )
}

const { issuer, resource, metadata } = getMcpUrls()
const fixtureClient = client

async function authorize(cookie: string, method: "post" | "basic") {
  const verifier = crypto.randomUUID() + crypto.randomUUID()
  const url = new URL(`${issuer}/oauth2/authorize`)
  url.search = new URLSearchParams({
    client_id: fixtureClient.id,
    redirect_uri: fixtureClient.redirectUri,
    response_type: "code",
    state: "fixture-state",
    scope: `${captureScope} offline_access`,
    resource,
  }).toString()
  const noPkce = await fetch(url, { headers: { cookie }, redirect: "manual" })
  assert.match(noPkce.headers.get("location") ?? "", /error=/)
  url.searchParams.set(
    "code_challenge",
    createHash("sha256").update(verifier).digest("base64url")
  )
  url.searchParams.set("code_challenge_method", "S256")

  const authorization = await fetch(url, {
    headers: { cookie },
    redirect: "manual",
  })
  assert.equal(authorization.status, 302)
  const consent = new URL(authorization.headers.get("location") ?? "", origin)
  assert.equal(consent.pathname, "/connect/consent")
  const decision = await fetch(`${issuer}/oauth2/consent`, {
    method: "POST",
    headers: { origin, cookie, "content-type": "application/json" },
    body: JSON.stringify({
      accept: true,
      oauth_query: consent.search.slice(1),
    }),
  })
  assert.equal(decision.status, 200)
  const redirect = new URL((await decision.json()).url)
  assert.equal(redirect.origin + redirect.pathname, fixtureClient.redirectUri)
  assert.equal(redirect.searchParams.get("state"), "fixture-state")
  const code = redirect.searchParams.get("code")
  assert.ok(code)
  const exchange = await fetch(`${issuer}/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      ...(method === "basic" && {
        authorization: `Basic ${Buffer.from(`${fixtureClient.id}:${fixtureClient.secret}`).toString("base64")}`,
      }),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      ...(method === "post" && {
        client_id: fixtureClient.id,
        client_secret: fixtureClient.secret,
      }),
      code,
      redirect_uri: fixtureClient.redirectUri,
      code_verifier: verifier,
      resource,
    }),
  })
  const tokens = await exchange.json()
  assert.equal(
    exchange.status,
    200,
    tokens.error_description ?? "Token exchange failed"
  )
  assert.ok(tokens.refresh_token)
  assert.ok(tokens.access_token)
  return String(tokens.access_token)
}

async function call(
  method: string,
  token?: string,
  args?: Record<string, unknown>
) {
  return fetch(resource, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(token && { authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      ...(args && { params: { name: "save_article", arguments: args } }),
    }),
  })
}

async function save(token: string, entry: Record<string, unknown>) {
  const response = await call("tools/call", token, entry)
  assert.equal(response.status, 200)
  const payload = await response.json()
  assert.ok(payload.result?.structuredContent, JSON.stringify(payload))
  return payload.result.structuredContent as {
    status: string
    articleId: string
    detailUrl: string
  }
}

try {
  assert.equal((await fetch(metadata)).status, 200)
  assert.equal(
    (await fetch(`${origin}/.well-known/oauth-authorization-server/api/auth`))
      .status,
    200
  )
  const denied = await call("tools/list")
  assert.equal(denied.status, 401)
  assert.match(
    denied.headers.get("www-authenticate") ?? "",
    /resource_metadata/
  )
  assert.equal((await call("tools/list", "invalid")).status, 401)

  const first = await createFixtureSession("reader@example.com")
  const second = await createFixtureSession("admin@example.com")
  await grantUserAccess("reader@example.com")
  const token = await authorize(first.cookie, "post")
  const otherToken = await authorize(second.cookie, "basic")
  assert.equal((await call("tools/list", token)).status, 200)

  const url = `https://example.com/${crypto.randomUUID()}?id=1`
  const captures = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      save(token, {
        url: `${url}&utm_source=${index}`,
        accessStatus: "unavailable",
      })
    )
  )
  assert.equal(captures.filter((item) => item.status === "created").length, 1)
  assert.equal(new Set(captures.map((item) => item.articleId)).size, 1)
  const [article] = captures
  const partial = await save(token, {
    url,
    title: "HTTP capture fixture",
    accessStatus: "partial",
    accessNotes: "Only the introduction was available",
  })
  assert.equal(partial.status, "updated")
  const full = await save(token, {
    url,
    accessStatus: "full",
    summary: "Fixture summary",
  })
  assert.equal(full.status, "updated")
  assert.equal(full.articleId, article.articleId)
  const duplicate = await save(token, {
    url: `${url}&utm=fake`,
    accessStatus: "unavailable",
  })
  assert.equal(duplicate.status, "already_exists")
  assert.equal(duplicate.articleId, article.articleId)
  const owned = await fetch(article.detailUrl, {
    headers: { cookie: first.cookie },
  })
  assert.equal(owned.status, 200)
  assert.match(await owned.text(), /Fixture summary/)
  const notOwned = await fetch(article.detailUrl, {
    headers: { cookie: second.cookie },
  })
  assert.equal(notOwned.status, 404)
  const other = await save(otherToken, { url, accessStatus: "unavailable" })
  assert.notEqual(other.articleId, article.articleId)
  await revokeUserAccess("reader@example.com")
  assert.equal((await call("tools/list", token)).status, 403)
  assert.equal(
    (
      await fetch(article.detailUrl, {
        headers: { cookie: first.cookie },
        redirect: "manual",
      })
    ).status,
    307
  )
  console.info(
    "Verified OAuth, MCP capture, concurrent deduplication, access upgrades, private article and revocation."
  )
} finally {
  await closeDatabaseConnection()
}
