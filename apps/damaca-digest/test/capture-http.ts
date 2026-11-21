import assert from "node:assert/strict"
import { createHash, randomUUID } from "node:crypto"
import { getAuthEnv, getChatGptClient, getDatabaseEnv } from "@/config/env"
import { installName } from "@/config/install-name"
import { captureScope, getMcpUrls, readScope } from "@/lib/auth/mcp-config"
import {
  acquireArticleFetch,
  allowArticleFetch,
  allowFirecrawl,
  consumeExternalFallbackConsent,
} from "@/lib/db/article-fetch-rate"
import {
  deleteArticle,
  saveArticle,
  updateArticleReading,
} from "@/lib/db/articles"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import { deleteEmptyTopic, listTopics, manageTopic } from "@/lib/db/topics"
import { grantUserAccess, revokeUserAccess } from "@/lib/db/user-access"
import { serverActionForm } from "./server-action-form"
import { createFixtureSession } from "./session-fixture"

const { baseUrl: origin, allowedEmails } = getAuthEnv()
const database = getDatabaseEnv()
const client = getChatGptClient()
if (
  !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
  !/^digest_capture_test_[a-z\d_]+$/.test(database.databaseName) ||
  !/^mongodb:\/\/127\.0\.0\.1:\d+(?:\/\?directConnection=true|\/)?$/.test(
    database.uri
  ) ||
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

async function authorize(
  cookie: string,
  method: "post" | "basic",
  scope: string = captureScope
) {
  const verifier = crypto.randomUUID() + crypto.randomUUID()
  const url = new URL(`${issuer}/oauth2/authorize`)
  url.search = new URLSearchParams({
    client_id: fixtureClient.id,
    redirect_uri: fixtureClient.redirectUri,
    response_type: "code",
    state: "fixture-state",
    scope: `${scope} offline_access`,
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
  const consentPage = await fetch(consent, { headers: { cookie } })
  assert.equal(consentPage.status, 200)
  const consentHtml = await consentPage.text()
  assert.equal(
    consentHtml.includes("Search and read saved articles"),
    scope.includes(readScope)
  )
  assert.equal(
    consentHtml.includes("Save articles in your private library"),
    scope.includes(captureScope)
  )
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
  args?: Record<string, unknown>,
  tool = "save_article"
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
      ...(args && { params: { name: tool, arguments: args } }),
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
  const manifest = await (await fetch(`${origin}/manifest.webmanifest`)).json()
  assert.deepEqual(manifest.share_target, {
    action: "/share",
    method: "GET",
    params: { url: "url", text: "text" },
  })
  const shared = await fetch(
    `${origin}/share?text=${encodeURIComponent("Article title\nhttps://example.com/shared")}`,
    {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 15) Chrome/140.0" },
    }
  )
  assert.equal(shared.status, 200)
  const sharedHtml = await shared.text()
  assert.match(sharedHtml, /Copy prompt and open ChatGPT/)
  assert.match(sharedHtml, /aria-label="Main navigation"/)
  assert.doesNotMatch(sharedHtml, /← Library/)
  assert.match(
    sharedHtml,
    /href="intent:\/\/#Intent;scheme=chatgpt;package=com.openai.chatgpt;S\.browser_fallback_url=https%3A%2F%2Fchatgpt.com%2F;end"/
  )
  assert.ok(sharedHtml.includes(`Use @${installName} to read`))
  assert.ok(sharedHtml.includes(`<strong>@${installName}</strong>`))
  assert.match(sharedHtml, /https:\/\/example.com\/shared/)
  const rejectedShare = await fetch(
    `${origin}/share?url=javascript%3Aalert%281%29`
  )
  const rejectedHtml = await rejectedShare.text()
  assert.match(rejectedHtml, /Share or paste a single HTTP or HTTPS link/)
  assert.doesNotMatch(rejectedHtml, /Copy prompt and open ChatGPT/)

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
  const accountKey = createHash("sha256").update(first.ownerId).digest("hex")
  const libraryCookie = `digest-filters-v1-library-${accountKey}`
  const topicsCookie = `digest-filters-v1-topics-${accountKey}`
  const fromBare = async (path: string, cookie: string) =>
    fetch(`${origin}${path}`, {
      headers: { cookie },
      redirect: "manual",
    })
  const migrating = await fromBare("/", first.cookie)
  const migratingHtml = await migrating.text()
  assert.match(migratingHtml, /Restoring filters/)
  assert.doesNotMatch(migratingHtml, /aria-label="Search articles"/)
  const filtersCookie = `${libraryCookie}=${encodeURIComponent("/?reading=read&reading=reading")}; ${topicsCookie}=${encodeURIComponent("/topics?q=Saved")}`
  const restoredLibrary = await fromBare(
    "/",
    `${first.cookie}; ${filtersCookie}`
  )
  assert.equal(restoredLibrary.status, 307)
  assert.equal(
    restoredLibrary.headers.get("location"),
    "/?reading=read&reading=reading"
  )
  const restoredTopics = await fromBare(
    "/topics",
    `${first.cookie}; ${filtersCookie}`
  )
  assert.equal(restoredTopics.status, 307)
  assert.equal(restoredTopics.headers.get("location"), "/topics?q=Saved")
  const otherAccount = await fromBare("/", `${second.cookie}; ${filtersCookie}`)
  assert.match(await otherAccount.text(), /Restoring filters/)
  const explicit = await fromBare(
    "/?reading=unread",
    `${first.cookie}; ${filtersCookie}`
  )
  assert.equal(explicit.status, 200)
  assert.match(await explicit.text(), /Remove Reading: unread filter/)
  first.cookie += `; ${libraryCookie}=-; ${topicsCookie}=-`

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
  const fetchDiagnostics = {
    provider: "direct",
    attempts: [
      { provider: "direct", status: "full", durationMs: 12, httpStatus: 200 },
    ],
    durationMs: 14,
    truncated: false,
  }
  const full = await save(token, {
    url,
    accessStatus: "full",
    summary: "Fixture summary",
    relatedLinks: [{ url: "https://example.com/recapture", origin: "source" }],
    fetchDiagnostics,
  })
  assert.equal(full.status, "updated")
  assert.equal(full.articleId, article.articleId)
  const duplicate = await save(token, {
    url: `${url}&utm=fake`,
    accessStatus: "unavailable",
  })
  assert.equal(duplicate.status, "already_exists")
  assert.equal(duplicate.articleId, article.articleId)
  const persisted = await (await getDatabase())
    .collection("articles")
    .findOne({ canonicalUrl: url })
  assert.deepEqual(persisted?.provenance.fetchDiagnostics, fetchDiagnostics)
  assert.equal(persisted?.content, undefined)
  assert.equal(persisted?.relatedLinks, undefined)

  const owner = crypto.randomUUID()
  const leases = await Promise.all([
    acquireArticleFetch(owner),
    acquireArticleFetch(owner),
  ])
  assert.equal(leases.filter(Boolean).length, 1)
  await leases.find(Boolean)?.()
  const renewed = await acquireArticleFetch(owner)
  assert.ok(renewed)
  await renewed()
  const clock = Date.now()
  const usage = await Promise.all(
    Array.from({ length: 6 }, () => allowArticleFetch(owner, clock))
  )
  assert.equal(usage.filter(Boolean).length, 5)
  assert.equal(await allowArticleFetch(owner, clock + 60_000), true)
  assert.equal(await allowFirecrawl(1, clock), true)
  assert.equal(await allowFirecrawl(1, clock), false)
  assert.equal(await allowFirecrawl(1, clock + 86_400_000), true)
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
  for (let index = 0; index < 21; index += 1) {
    await saveArticle(first.ownerId, {
      url: `https://example.com/library-${index}`,
      title: `Pagination Fixture ${String(index).padStart(2, "0")}`,
      authors: ["A. Writer"],
      source: "Fixture source",
      publishedAt: "2026-11-15T15:00:00.000Z",
      accessStatus: "full",
    })
  }
  const otherOwnerFixture = await saveArticle(second.ownerId, {
    url: "https://example.com/library-private",
    title: "Pagination Fixture Other Owner",
    authors: ["A. Writer"],
    source: "Fixture source",
    publishedAt: "2026-11-15T15:00:00.000Z",
    accessStatus: "full",
  })
  const libraryUrl = `${origin}/?q=Pagination&author=A.+Writer&source=Fixture+source&access=full&publishedTo=2026-11-15&sort=title`
  const firstPage = await fetch(libraryUrl, {
    headers: { cookie: first.cookie },
  })
  assert.equal(firstPage.status, 200)
  const firstHtml = await firstPage.text()
  assert.match(firstHtml, /Pagination Fixture 00/)
  assert.match(firstHtml, /Pagination Fixture 19/)
  assert.doesNotMatch(firstHtml, /Pagination Fixture 20|Other Owner/)
  const secondPage = await fetch(`${libraryUrl}&page=2`, {
    headers: { cookie: first.cookie },
  })
  assert.equal(secondPage.status, 200)
  const secondHtml = await secondPage.text()
  assert.match(secondHtml, /Pagination Fixture 20/)
  assert.match(
    secondHtml,
    /href="[^"]*author=A\.\+Writer[^"]*">(?:<[^>]+>)*A\. Writer/
  )
  assert.doesNotMatch(secondHtml, /Pagination Fixture 19|Other Owner/)
  const relevance = await fetch(`${origin}/?q=Pagination&sort=relevance`, {
    headers: { cookie: first.cookie },
  })
  assert.equal(relevance.status, 200)
  assert.match(await relevance.text(), /Pagination Fixture/)
  const invalid = await fetch(
    `${origin}/?publishedFrom=2026-12-01&publishedTo=2026-11-01`,
    { headers: { cookie: first.cookie } }
  )
  assert.match(await invalid.text(), /Check the search filters and date ranges/)

  console.info("Verified library search and pagination.")
  const editUrl = `${other.detailUrl}/edit`
  function submit(cookie: string, body: FormData) {
    return fetch(editUrl, {
      method: "POST",
      headers: { cookie, origin },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
  }
  const wrongEditor = await fetch(editUrl, {
    headers: { cookie: first.cookie },
  })
  assert.equal(wrongEditor.status, 404)
  assert.match(await wrongEditor.text(), /Article not found/)
  const editor = await fetch(editUrl, { headers: { cookie: second.cookie } })
  assert.equal(editor.status, 200)
  const editorHtml = await editor.text()
  assert.match(editorHtml, /aria-label="Edit article actions"/)
  assert.match(
    editorHtml,
    /aria-label="Reading status: unread\. Change to reading"/
  )
  assert.match(editorHtml, /aria-label="Save changes"/)
  assert.match(editorHtml, /aria-label="Delete article"/)
  assert.match(editorHtml, /<dialog[^>]*aria-labelledby=/)
  const [editForm] = [...editorHtml.matchAll(/<form[\s\S]*?<\/form>/g)]
    .map(([form]) => form)
    .filter((form) => form.includes('name="personalNotes"'))
  assert.ok(editForm)
  const edits = serverActionForm(editForm)
  for (const [key, value] of Object.entries({
    title: "Manually corrected title",
    authors: "Fixture Editor",
    source: "Fixture source",
    publishedAt: "2026-11-15",
    language: "en",
    contentType: "article",
    summary: "",
    keyTakeaways: "",
    topics: "Personal topic",
    personalNotes: "Reader's private note",
    readingStatus: "read",
    favorite: "true",
  }))
    edits.set(key, value)
  assert.notEqual((await submit(first.cookie, edits)).status, 303)
  console.info("Verified editor isolation.")
  const savedEdits = await submit(second.cookie, edits)
  assert.equal(savedEdits.status, 303)
  await save(otherToken, {
    url,
    accessStatus: "full",
    title: "ChatGPT title",
    summary: "New capture summary",
    topics: ["ChatGPT topic"],
  })
  const enriched = await fetch(other.detailUrl, {
    headers: { cookie: second.cookie },
  })
  const enrichedHtml = await enriched.text()
  assert.match(enrichedHtml, /Manually corrected title/)
  assert.match(enrichedHtml, /Reader.*private note/)
  assert.match(enrichedHtml, /New capture summary/)
  assert.match(enrichedHtml, /Personal topic/)
  assert.doesNotMatch(enrichedHtml, /ChatGPT topic/)
  assert.match(enrichedHtml, /read · Favorite|read<!-- --> · Favorite/)
  const jsonUrl = `${other.detailUrl}/export?format=json`
  const privateExport = await fetch(jsonUrl, {
    headers: { cookie: first.cookie },
  })
  assert.equal(privateExport.status, 404)
  const exported = await fetch(jsonUrl, { headers: { cookie: second.cookie } })
  assert.equal(exported.status, 200)
  assert.equal(exported.headers.get("cache-control"), "private, no-store")
  assert.match(
    exported.headers.get("content-disposition") ?? "",
    /attachment.*\.json/
  )
  const snapshot = await exported.json()
  assert.equal(snapshot.title, "Manually corrected title")
  assert.equal(snapshot.personalNotes, "Reader's private note")
  assert.deepEqual(snapshot.topics, ["Personal topic"])
  assert.equal("ownerId" in snapshot, false)
  assert.equal("revision" in snapshot, false)
  const markdown = await fetch(`${other.detailUrl}/export?format=md`, {
    headers: { cookie: second.cookie },
  })
  assert.equal(markdown.status, 200)
  assert.match(
    await markdown.text(),
    /## Personal notes\n\nReader's private note/
  )

  console.info("Verified that recapture preserves manual edits.")
  const updatedEditor = await fetch(editUrl, {
    headers: { cookie: second.cookie },
  })
  const updatedHtml = await updatedEditor.text()
  const [deleteForm] = [...updatedHtml.matchAll(/<form[\s\S]*?<\/form>/g)]
    .map(([form]) => form)
    .filter((form) => form.includes('name="confirm"'))
  assert.ok(deleteForm)
  function confirmDeletion() {
    const data = serverActionForm(deleteForm)
    data.set("confirm", "true")
    return data
  }
  const unconfirmed = await submit(second.cookie, serverActionForm(deleteForm))
  assert.match(unconfirmed.headers.get("location") ?? "", /deletion=confirm$/)
  await unconfirmed.body?.cancel()
  const wrongDeletion = await submit(first.cookie, confirmDeletion())
  assert.match(wrongDeletion.headers.get("location") ?? "", /deletion=failed$/)
  await wrongDeletion.body?.cancel()
  const deleted = await submit(second.cookie, confirmDeletion())
  assert.equal(deleted.status, 303)
  assert.equal(
    (await fetch(other.detailUrl, { headers: { cookie: second.cookie } }))
      .status,
    404
  )

  const db = await getDatabase()
  await db
    .collection("articles")
    .updateOne(
      { ownerId: first.ownerId, canonicalUrl: url },
      { $set: { proposedTopics: ["Engineering"] } }
    )
  const withTopics = await save(token, {
    url: "https://example.com/topic-fixture",
    title: "Topic fixture",
    accessStatus: "full",
    topics: ["A.I.", "ENGINEERING"],
  })

  async function vocabularyFor(bearer: string, query?: string) {
    const response = await call(
      "tools/call",
      bearer,
      query ? { query } : {},
      "list_topics"
    )
    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.ok(payload.result?.structuredContent, JSON.stringify(payload))
    return payload.result.structuredContent.topics as {
      id: string
      label: string
      aliases: string[]
    }[]
  }

  const topics = await vocabularyFor(token)
  const ai = topics.find(({ label }) => label === "A.I.")
  const engineering = topics.find(({ label }) => label === "Engineering")
  assert.ok(ai && engineering)
  assert.deepEqual(
    (await vocabularyFor(otherToken)).map(({ label }) => label),
    ["Personal topic"]
  )

  const topicsUrl = `${origin}/topics`
  async function manage(cookie: string, fields: Record<string, string>) {
    const page = await fetch(topicsUrl, { headers: { cookie: first.cookie } })
    const html = await page.text()
    const form = [...html.matchAll(/<form[\s\S]*?<\/form>/g)]
      .map(([value]) => value)
      .find((value) => value.includes('name="operation"'))
    assert.ok(form)
    const body = serverActionForm(form)
    for (const [key, value] of Object.entries(fields)) body.set(key, value)
    const response = await fetch(topicsUrl, {
      method: "POST",
      headers: { cookie, origin },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
    assert.equal(response.status, 303)
    return response.headers.get("location")
  }

  const alias = {
    operation: "alias",
    topicId: ai.id,
    label: "Artificial intelligence",
  }
  assert.equal(await manage(second.cookie, alias), "/topics?result=conflict")
  assert.equal(await manage(first.cookie, alias), "/topics")
  assert.equal(
    await manage(first.cookie, {
      operation: "merge",
      topicId: ai.id,
      targetId: engineering.id,
    }),
    "/topics"
  )
  const merged = await vocabularyFor(token, "artificial intelligence")
  assert.equal(merged.length, 1)
  assert.equal(merged[0].id, engineering.id)
  assert.ok(merged[0].aliases.includes("A.I."))
  const mergedPage = await fetch(topicsUrl, {
    headers: { cookie: first.cookie },
  })
  assert.match(await mergedPage.text(), /\(2\)/)
  const matchingTopics = await fetch(`${topicsUrl}?q=ARTIFICIAL+INTELLIGENCE`, {
    headers: { cookie: first.cookie },
  })
  assert.match(await matchingTopics.text(), /href="\/\?topic=Engineering"/)
  const noTopics = await fetch(`${topicsUrl}?q=missing-fixture-label`, {
    headers: { cookie: first.cookie },
  })
  assert.match(await noTopics.text(), /No matching topics/)
  const byAlias = await fetch(`${origin}/?topic=Artificial+intelligence`, {
    headers: { cookie: first.cookie },
  })
  const byAliasHtml = await byAlias.text()
  assert.match(byAliasHtml, /Topic fixture/)
  assert.match(byAliasHtml, /href="\/\?topic=Engineering"/)
  assert.match(byAliasHtml, /href="https:\/\/example\.com\//)
  assert.match(byAliasHtml, /HTTP capture fixture/)
  const related = await fetch(withTopics.detailUrl, {
    headers: { cookie: first.cookie },
  })
  const relatedHtml = await related.text()
  assert.match(relatedHtml, /aria-label="Topics".*Engineering/)
  assert.match(relatedHtml, /Related articles/)
  assert.match(relatedHtml, /aria-label="Article actions"/)
  assert.match(relatedHtml, /aria-label="Open original"/)
  assert.match(relatedHtml, /aria-label="Download JSON"/)
  assert.match(relatedHtml, new RegExp(`/articles/${article.articleId}`))

  async function invoke(
    bearer: string,
    tool: string,
    input: Record<string, unknown>
  ) {
    const response = await call("tools/call", bearer, input, tool)
    assert.equal(response.status, 200)
    return (await response.json()).result
  }
  const writerRead = await invoke(token, "get_article", {
    id: article.articleId,
  })
  assert.equal(writerRead.isError, true)
  assert.match(writerRead._meta["mcp/www_authenticate"][0], /articles:read/)
  const reader = await authorize(first.cookie, "basic", readScope)
  const otherReader = await authorize(second.cookie, "post", readScope)
  const recoveryUrl = "https://8.8.8.8/digest-http-fixture"
  const deniedFetch = await invoke(reader, "fetch_article", {
    url: recoveryUrl,
  })
  assert.equal(deniedFetch.isError, true)
  assert.match(deniedFetch._meta["mcp/www_authenticate"][0], /articles:write/)
  const deniedDestination = await invoke(token, "fetch_article", {
    url: "http://169.254.169.254/",
  })
  assert.equal(deniedDestination.isError, true)
  const recovery = await invoke(token, "fetch_article", { url: recoveryUrl })
  assert.equal(recovery.structuredContent.accessStatus, "unavailable")
  assert.equal(recovery.structuredContent.content, undefined)
  assert.equal(recovery.structuredContent.attempts.length, 3)
  const offer = recovery.structuredContent.externalFallbackOffer
  assert.equal(offer.url, recoveryUrl)
  assert.deepEqual(offer.providers, ["jina"])
  assert.equal(recovery.structuredContent.attempts[1]?.reason, "policy")
  const changedUrl = await invoke(token, "fetch_article", {
    url: `${recoveryUrl}-different`,
    externalFallbackToken: offer.token,
  })
  assert.equal(changedUrl.isError, true)
  const rejectedOwner = await invoke(otherToken, "fetch_article", {
    url: recoveryUrl,
    externalFallbackToken: offer.token,
  })
  assert.equal(rejectedOwner.isError, true)
  const nonce = randomUUID()
  const expiry = Date.now() + 600_000
  const signal = new AbortController().signal
  const uses = await Promise.all(
    Array.from({ length: 5 }, () =>
      consumeExternalFallbackConsent(nonce, expiry, signal)
    )
  )
  assert.equal(uses.filter(Boolean).length, 1)
  const unsaved = await invoke(reader, "get_article", { url: recoveryUrl })
  assert.equal(unsaved.structuredContent.article, null)
  const readByUrl = await invoke(reader, "get_article", {
    url: `${url}&utm=fake`,
  })
  assert.equal(readByUrl.structuredContent.article.id, article.articleId)
  assert.equal("personalNotes" in readByUrl.structuredContent.article, false)
  assert.equal(
    (await invoke(otherReader, "get_article", { id: article.articleId }))
      .structuredContent.article,
    null
  )
  const relatedInput = { id: withTopics.articleId }
  const relatedRead = await invoke(
    reader,
    "find_related_articles",
    relatedInput
  )
  assert.equal(relatedRead.structuredContent.articles[0]?.id, article.articleId)
  const otherRelated = await invoke(
    otherReader,
    "find_related_articles",
    relatedInput
  )
  assert.deepEqual(otherRelated.structuredContent.articles, [])
  const writerRelated = await invoke(
    token,
    "find_related_articles",
    relatedInput
  )
  assert.match(writerRelated._meta["mcp/www_authenticate"][0], /articles:read/)
  const query = { q: "Pagination", author: "A. Writer", page: 2, sort: "title" }
  const searched = await invoke(reader, "search_articles", query)
  assert.deepEqual(
    searched.structuredContent.articles.map(
      ({ title }: { title: string }) => title
    ),
    ["Pagination Fixture 20"]
  )
  assert.equal(searched.structuredContent.nextPage, null)
  const capturedAt = Date.parse(readByUrl.structuredContent.article.capturedAt)
  const dates = (offset: number) =>
    new Date(capturedAt + offset * 86_400_000).toISOString().slice(0, 10)
  const digestInput = { capturedFrom: dates(-1), capturedTo: dates(1) }
  type DigestDay = {
    date: string
    articles: { id: string; capturedAt: string }[]
  }
  const digest = await invoke(reader, "get_reading_digest", digestInput)
  const firstDays: DigestDay[] = digest.structuredContent.days
  assert.equal(firstDays.flatMap(({ articles }) => articles).length, 20)
  assert.equal(digest.structuredContent.nextPage, 2)
  const remainingDigest = await invoke(reader, "get_reading_digest", {
    ...digestInput,
    page: 2,
  })
  const remainingDays: DigestDay[] = remainingDigest.structuredContent.days
  assert.equal(remainingDays.flatMap(({ articles }) => articles).length, 3)
  assert.equal(remainingDigest.structuredContent.nextPage, null)
  for (const { date, articles } of [...firstDays, ...remainingDays]) {
    assert.ok(articles.every((item) => item.capturedAt.startsWith(date)))
  }
  const otherDigest = await invoke(
    otherReader,
    "get_reading_digest",
    digestInput
  )
  const otherDays: DigestDay[] = otherDigest.structuredContent.days
  const otherIds = otherDays.flatMap(({ articles }) =>
    articles.map(({ id }) => id)
  )
  assert.deepEqual(otherIds, [otherOwnerFixture.articleId])
  const writerDigest = await invoke(token, "get_reading_digest", digestInput)
  assert.match(writerDigest._meta["mcp/www_authenticate"][0], /articles:read/)
  const readerWrite = await invoke(reader, "save_article", {
    url: "https://example.com/readonly-attempt",
    accessStatus: "unavailable",
  })
  assert.equal(readerWrite.isError, true)
  assert.match(readerWrite._meta["mcp/www_authenticate"][0], /articles:write/)

  const libraryJson = await fetch(`${origin}/settings/export?format=json`, {
    headers: { cookie: first.cookie },
  })
  assert.equal(libraryJson.status, 200)
  assert.equal(libraryJson.headers.get("cache-control"), "private, no-store")
  const backup = (await libraryJson.json()) as {
    id: string
    title: string
    topics: string[]
  }[]
  assert.equal(backup.length, 23)
  assert.equal(
    backup.some(({ title }) => title.includes("Other Owner")),
    false
  )
  assert.deepEqual(
    backup.find(({ id }) => id === withTopics.articleId)?.topics,
    ["Engineering"]
  )
  const libraryMarkdown = await fetch(`${origin}/settings/export?format=md`, {
    headers: { cookie: first.cookie },
  })
  assert.equal(libraryMarkdown.status, 200)
  const backupMarkdown = await libraryMarkdown.text()
  assert.match(backupMarkdown, /^# Damaca Digest/)
  assert.match(backupMarkdown, /## Topic fixture/)
  assert.doesNotMatch(backupMarkdown, /Other Owner/)

  const readingForm = [...relatedHtml.matchAll(/<form[\s\S]*?<\/form>/g)]
    .map(([form]) => form)
    .find((form) => form.includes('name="readingChange"'))
  assert.ok(readingForm)
  async function changeReading(
    form: string,
    cookie: string,
    operation: string
  ) {
    const body = serverActionForm(form)
    body.set("readingChange", operation)
    return fetch(withTopics.detailUrl, {
      method: "POST",
      headers: { cookie, origin },
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
  }
  const invalidReading = await changeReading(
    readingForm,
    first.cookie,
    "unknown"
  )
  assert.equal(invalidReading.status, 303)
  const deniedReading = await changeReading(
    readingForm,
    second.cookie,
    "favorite"
  )
  assert.match(
    deniedReading.headers.get("location") ?? "",
    /readingUpdate=failed/
  )
  const changedReading = await changeReading(readingForm, first.cookie, "read")
  assert.equal(changedReading.status, 303)
  assert.doesNotMatch(changedReading.headers.get("location") ?? "", /failed/)
  const staleReading = await changeReading(
    readingForm,
    first.cookie,
    "favorite"
  )
  assert.match(
    staleReading.headers.get("location") ?? "",
    /readingUpdate=failed/
  )
  const updatedReading = await invoke(reader, "get_article", relatedInput)
  assert.equal(updatedReading.structuredContent.article.readingStatus, "read")
  assert.equal(updatedReading.structuredContent.article.favorite, false)

  for (const [current, next] of [
    ["read", "archived"],
    ["archived", "unread"],
    ["unread", "reading"],
    ["reading", "read"],
  ]) {
    const page = await fetch(withTopics.detailUrl, {
      headers: { cookie: first.cookie },
    })
    const html = await page.text()
    const form = [...html.matchAll(/<form[\s\S]*?<\/form>/g)]
      .map(([markup]) => markup)
      .find((markup) => markup.includes('name="readingChange"'))
    assert.ok(form)
    assert.ok(form.includes(`Reading status: ${current}. Change to ${next}`))
    const response = await changeReading(form, first.cookie, next)
    assert.equal(response.status, 303)
    assert.doesNotMatch(response.headers.get("location") ?? "", /failed/)
  }

  const topicOwner = first.ownerId
  const fixture = await saveArticle(topicOwner, {
    url: "https://example.org/topic-deletion",
    accessStatus: "full",
    summary: "Fixture summary",
    topics: ["Empty topic fixture"],
  })
  const targetSeed = await saveArticle(topicOwner, {
    url: "https://example.org/topic-deletion-target",
    accessStatus: "full",
    summary: "Fixture summary",
    topics: ["Merged topic fixture"],
  })
  assert.equal(await deleteArticle(topicOwner, targetSeed.articleId, 0), true)
  const fixtureTopics = await listTopics(topicOwner, true)
  const empty = fixtureTopics.find(
    ({ label }) => label === "Empty topic fixture"
  )
  const mergeTarget = fixtureTopics.find(
    ({ label }) => label === "Merged topic fixture"
  )
  assert.ok(empty && mergeTarget)
  assert.equal(await deleteEmptyTopic(second.ownerId, empty.id), "missing")
  assert.equal(await deleteEmptyTopic(topicOwner, empty.id), "in_use")
  assert.equal(
    await manageTopic(topicOwner, {
      operation: "merge",
      topicId: empty.id,
      targetId: mergeTarget.id,
    }),
    true
  )
  assert.equal(await deleteEmptyTopic(topicOwner, mergeTarget.id), "in_use")
  const engineeringTopic = (await listTopics(topicOwner)).find(
    ({ label }) => label === "Engineering"
  )
  assert.ok(engineeringTopic)
  assert.equal(
    await deleteEmptyTopic(topicOwner, engineeringTopic.id),
    "in_use"
  )
  assert.equal(await deleteArticle(topicOwner, fixture.articleId, 0), true)

  const emptyTopicUrl = `${origin}/topics?q=Merged+topic+fixture`
  const markedEmpty = await fetch(emptyTopicUrl, {
    headers: { cookie: first.cookie },
  })
  const emptyHtml = await markedEmpty.text()
  assert.match(emptyHtml, /aria-label="Delete topic: Merged topic fixture"/)
  assert.match(emptyHtml, />\(\s*(?:<!-- -->)?0(?:<!-- -->)?\)</)
  const topicDeleteForm = [...emptyHtml.matchAll(/<form[\s\S]*?<\/form>/g)]
    .map(([markup]) => markup)
    .find((markup) => markup.includes('aria-label="Confirm deletion"'))
  assert.ok(topicDeleteForm)
  const topicDeleteBody = serverActionForm(topicDeleteForm)
  topicDeleteBody.set("topicId", mergeTarget.id)
  topicDeleteBody.set("q", "Merged topic fixture")
  const unconfirmedTopic = await fetch(emptyTopicUrl, {
    method: "POST",
    headers: { cookie: first.cookie, origin },
    body: topicDeleteBody,
    redirect: "manual",
  })
  assert.match(
    unconfirmedTopic.headers.get("location") ?? "",
    /result=delete_failed/
  )
  topicDeleteBody.set("confirm", "true")
  const topicRemoved = await fetch(emptyTopicUrl, {
    method: "POST",
    headers: { cookie: first.cookie, origin },
    body: topicDeleteBody,
    redirect: "manual",
  })
  assert.equal(topicRemoved.status, 303)
  assert.match(
    topicRemoved.headers.get("location") ?? "",
    /q=Merged\+topic\+fixture$/
  )
  assert.equal(
    (await listTopics(topicOwner)).some(({ id }) => id === mergeTarget.id),
    false
  )

  const concurrent = await saveArticle(topicOwner, {
    url: "https://example.org/topic-race-old",
    accessStatus: "full",
    summary: "Fixture summary",
    topics: ["Concurrent topic fixture"],
  })
  assert.equal(await deleteArticle(topicOwner, concurrent.articleId, 0), true)
  const raceTopic = (await listTopics(topicOwner)).find(
    ({ label }) => label === "Concurrent topic fixture"
  )
  assert.ok(raceTopic)
  const [removal, captured] = await Promise.all([
    deleteEmptyTopic(topicOwner, raceTopic.id),
    saveArticle(topicOwner, {
      url: "https://example.org/topic-race-new",
      accessStatus: "full",
      summary: "Fixture summary",
      topics: [raceTopic.label],
    }),
  ])
  assert.ok(removal === "deleted" || removal === "in_use")
  assert.equal(captured.status, "created")
  assert.equal(
    (await listTopics(topicOwner, true)).find(
      ({ label }) => label === raceTopic.label
    )?.articleCount,
    1
  )

  for (const [name, language, readingStatus] of [
    ["Spanish reading fixture", "es", "reading"],
    ["Spanish read fixture", "es", "read"],
    ["Spanish unread fixture", "es", "unread"],
    ["English read fixture", "en", "read"],
  ] as const) {
    const saved = await saveArticle(first.ownerId, {
      url: `https://example.org/${name.toLowerCase().replaceAll(" ", "-")}`,
      title: name,
      language,
      accessStatus: "full",
      summary: "Filter fixture",
    })
    assert.equal(
      await updateArticleReading(first.ownerId, saved.articleId, 0, {
        readingStatus,
      }),
      true
    )
  }
  const filteredLibrary = async (search: string) => {
    const response = await fetch(`${origin}/?${search}`, {
      headers: { cookie: first.cookie },
    })
    assert.equal(response.status, 200)
    return response.text()
  }

  const multi = await filteredLibrary(
    "reading=reading&reading=read&language=es"
  )
  assert.match(multi, /Spanish reading fixture/)
  assert.match(multi, /Spanish read fixture/)
  assert.doesNotMatch(multi, /Spanish unread fixture|English read fixture/)
  assert.match(multi, /Remove Reading: reading filter/)
  assert.match(multi, /Remove Reading: read filter/)
  assert.match(multi, /Filter by language: es/)
  const single = await filteredLibrary("reading=unread&language=es")
  assert.match(single, /Spanish unread fixture/)
  assert.doesNotMatch(single, /Spanish reading fixture|English read fixture/)
  const languageOnly = await filteredLibrary("language=es")
  assert.match(
    languageOnly,
    /<a(?=[^>]*href="\/\?language=es&amp;reading=reading")(?=[^>]*aria-label="Filter by reading status: reading")/
  )
  assert.match(multi, /3(?:<!-- -->)?\s*(?:<!-- -->)?active filters/)
  for (const [label, expected] of [
    ["Filter by source: example.org", "source=example.org"],
    ["Filter by source access: full", "access=full"],
  ]) {
    const link = [...languageOnly.matchAll(/<a[^>]+>/g)]
      .map(([markup]) => markup)
      .find((markup) => markup.includes(`aria-label="${label}"`))
    assert.ok(link)
    const href = link.match(/href="([^"]+)"/)?.[1]
    assert.ok(href)
    assert.ok(href.includes("language=es") && href.includes(expected))
  }
  assert.match(languageOnly, /Captured <time/)
  const missingLanguage = await filteredLibrary("language=fr")
  assert.match(missingLanguage, /name="language"[^>]*value="fr"/)
  assert.match(missingLanguage, /No articles match/)
  const scalarMcp = await invoke(reader, "search_articles", {
    reading: "read",
    language: "en",
  })
  assert.deepEqual(
    scalarMcp.structuredContent.articles.map(
      ({ title }: { title: string }) => title
    ),
    ["English read fixture"]
  )

  const mentioned = await save(token, {
    url: "https://example.com/link-fixture",
    accessStatus: "partial",
    accessNotes: "Only the article introduction was available",
    relatedLinks: [
      { url: "https://example.com/guide?utm_source=fixture", origin: "source" },
      {
        url: "https://example.com/guide",
        title: "Source guide",
        origin: "source",
      },
      { url: "https://example.com/link-fixture#intro", origin: "source" },
      { url: "https://example.com/suggestion", origin: "ai_suggested" },
    ],
  })
  assert.equal(mentioned.status, "created")
  const refreshed = await save(token, {
    url: "https://example.com/link-fixture",
    accessStatus: "full",
    relatedLinks: [
      { url: "https://example.com/replacement", origin: "source" },
    ],
  })
  assert.equal(refreshed.status, "updated")
  assert.equal(refreshed.articleId, mentioned.articleId)
  const detail = await fetch(mentioned.detailUrl, {
    headers: { cookie: first.cookie },
  })
  assert.equal(detail.status, 200)
  const detailHtml = await detail.text()
  assert.match(detailHtml, /Mentioned links/)
  assert.match(detailHtml, /AI link suggestions/)
  assert.match(detailHtml, /Source guide/)
  assert.doesNotMatch(detailHtml, /https:\/\/example\.com\/replacement/)
  assert.equal(
    [...detailHtml.matchAll(/href="https:\/\/example\.com\/guide"/g)].length,
    1
  )
  assert.doesNotMatch(
    detailHtml,
    /href="https:\/\/example\.com\/link-fixture#intro"/
  )

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
