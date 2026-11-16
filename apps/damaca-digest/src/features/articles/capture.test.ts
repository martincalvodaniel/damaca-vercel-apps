import { expect, test as it } from "bun:test"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { createArticleServer } from "@/features/articles/mcp-server"
import { normalizeArticleUrl } from "@/features/articles/normalize-url"
import { captureArticle } from "@/schemas/article"

it("strips only known tracking parameters and preserves functional encoding and fragments", () => {
  expect(
    normalizeArticleUrl(
      "https://example.com/?q=a%20b&UTM_Source=a&q=c&fbclid=foo#section"
    )
  ).toBe("https://example.com/?q=a%20b&q=c#section")
})

it("treats the bare utm parameter as tracking", () => {
  expect(
    normalizeArticleUrl("https://proton.me/blog/ai-manifesto?utm=fake")
  ).toBe("https://proton.me/blog/ai-manifesto")
})

it("validates access limitations, references, URLs and ownership", () => {
  const link = { url: "https://example.com" }
  const unavailable = { ...link, accessStatus: "unavailable" }
  expect(captureArticle.safeParse(unavailable).success).toBe(true)
  expect(
    captureArticle.safeParse({ ...unavailable, summary: "Made up" }).success
  ).toBe(false)
  expect(
    captureArticle.safeParse({
      ...unavailable,
      relatedLinks: [{ ...link, origin: "source" }],
    }).success
  ).toBe(false)
  expect(
    captureArticle.safeParse({
      ...unavailable,
      relatedLinks: [{ ...link, origin: "ai_suggested" }],
    }).success
  ).toBe(true)
  expect(
    captureArticle.safeParse({ ...unavailable, ownerId: "other" }).success
  ).toBe(false)
  expect(
    captureArticle.safeParse({
      ...unavailable,
      url: "https://user:pass@example.com",
    }).success
  ).toBe(false)
  expect(
    captureArticle.safeParse({ ...unavailable, url: "javascript:alert(1)" })
      .success
  ).toBe(false)
  expect(
    captureArticle.safeParse({ ...unavailable, accessStatus: "partial" })
      .success
  ).toBe(false)
  expect(
    captureArticle.safeParse({
      ...unavailable,
      accessStatus: "partial",
      accessNotes: "Preview only",
    }).success
  ).toBe(true)
})

it("registers the capture schema and returns structured results over MCP", async () => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()
  const client = new Client({ name: "Digest contract test", version: "1.0.0" })
  const result = {
    articleId: "0123456789abcdef01234567",
    status: "created" as const,
    canonicalUrl: "https://example.com/",
    detailUrl: "https://digest.example.com/articles/0123456789abcdef01234567",
    warnings: [],
  }
  const server = createArticleServer(
    async () => result,
    async () => [{ id: "fixture", label: "Engineering", aliases: [] }],
    true
  )
  await server.connect(serverTransport)
  await client.connect(clientTransport)
  try {
    expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([
      "save_article",
      "list_topics",
    ])
    const topics = await client.callTool({
      name: "list_topics",
      arguments: { query: "engine" },
    })
    expect(topics.structuredContent).toEqual({
      topics: [{ id: "fixture", label: "Engineering", aliases: [] }],
      nextPage: null,
    })
    const save = (args: Record<string, unknown>) =>
      client.callTool({ name: "save_article", arguments: args })
    expect(
      (await save({ url: result.canonicalUrl, accessStatus: "full" }))
        .structuredContent
    ).toEqual(result)
    expect(
      (await save({ url: result.canonicalUrl, accessStatus: "partial" }))
        .isError
    ).toBe(true)
  } finally {
    await client.close()
    await server.close()
  }
})
