import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { getAuthEnv, getChatGptClient, getDatabaseEnv } from "@/config/env"
import { captureScope, getMcpUrls, readScope } from "@/lib/auth/mcp-config"
import { saveArticle } from "@/lib/db/articles"
import { closeDatabaseConnection, getDatabase } from "@/lib/db/client"
import { grantUserAccess, revokeUserAccess } from "@/lib/db/user-access"
import { serverActionForm } from "./server-action-form"
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
    { redirect: "manual" }
  )
  assert.equal(shared.status, 200)
  const sharedHtml = await shared.text()
  assert.match(sharedHtml, /Copy prompt and open ChatGPT/)
  assert.match(sharedHtml, /Use @damaca-digest/)
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
  await saveArticle(second.ownerId, {
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
  const editor = await fetch(editUrl, { headers: { cookie: second.cookie } })
  assert.equal(editor.status, 200)
  const editorHtml = await editor.text()
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
      .find((value) => value.includes(`value="${fields.operation}"`))
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
  assert.match(await mergedPage.text(), /2(?:<!-- -->)? articles/)
  const byAlias = await fetch(`${origin}/?topic=Artificial+intelligence`, {
    headers: { cookie: first.cookie },
  })
  const byAliasHtml = await byAlias.text()
  assert.match(byAliasHtml, /Topic fixture/)
  assert.match(byAliasHtml, /HTTP capture fixture/)
  const related = await fetch(withTopics.detailUrl, {
    headers: { cookie: first.cookie },
  })
  const relatedHtml = await related.text()
  assert.match(relatedHtml, /aria-label="Topics".*Engineering/)
  assert.match(relatedHtml, /Related articles/)
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
