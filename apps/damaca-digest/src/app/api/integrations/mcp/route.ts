import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { registerReadingTools } from "@/features/articles/mcp-reading-tools"
import { createArticleServer } from "@/features/articles/mcp-server"
import { captureScope, getMcpUrls } from "@/lib/auth/mcp-config"
import { getMcpOwner } from "@/lib/auth/mcp-owner"
import { saveArticle } from "@/lib/db/articles"
import { allowCapture } from "@/lib/db/capture-rate"
import { listTopics } from "@/lib/db/topics"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const headers = new Headers({ "Cache-Control": "no-store" })
  try {
    const owner = await getMcpOwner(request)
    const { metadata, resource } = getMcpUrls()
    if (owner.status !== 200) {
      if (owner.status === 401) {
        headers.set(
          "WWW-Authenticate",
          `Bearer resource_metadata="${metadata}", scope="${captureScope}"`
        )
      }
      return new Response(null, { status: owner.status, headers })
    }

    const server = createArticleServer(
      async (entry) => {
        if (!(await allowCapture(owner.ownerId))) return null
        const article = await saveArticle(owner.ownerId, entry)
        return {
          ...article,
          detailUrl: new URL(`/articles/${article.articleId}`, resource).href,
          warnings:
            entry.accessStatus === "full"
              ? []
              : [`Reported access: ${entry.accessStatus}.`],
        }
      },
      async () =>
        (await listTopics(owner.ownerId)).map(({ id, label, aliases }) => ({
          id,
          label,
          aliases,
        })),
      owner.canCapture
    )
    registerReadingTools(server, owner.ownerId, owner.canRead, resource)
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      maxRequestBodySize: 131_072,
    })
    await server.connect(transport)
    try {
      const response = await transport.handleRequest(request)
      response.headers.set("Cache-Control", "no-store")
      return response
    } finally {
      await server.close()
    }
  } catch {
    return new Response(null, { status: 503, headers })
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } })
}

export { GET as DELETE }
