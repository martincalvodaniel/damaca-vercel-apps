import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createMenuServer } from "@/features/meal-planning/mcp-menu-server"
import { getMcpAccessStatus } from "@/lib/auth/mcp-access"
import { getMcpUrls } from "@/lib/auth/mcp-config"
import { menuReadScope } from "@/lib/auth/mcp-paths"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const headers = new Headers({ "Cache-Control": "no-store" })
  try {
    const status = await getMcpAccessStatus(request)
    if (status !== 200) {
      if (status === 401) {
        const { metadata } = getMcpUrls()
        headers.set(
          "WWW-Authenticate",
          `Bearer resource_metadata="${metadata}", scope="${menuReadScope}"`
        )
      }
      return new Response(null, { status, headers })
    }

    const server = createMenuServer()
    const transport = new WebStandardStreamableHTTPServerTransport({
      enableJsonResponse: true,
      maxRequestBodySize: 32_768,
    })
    try {
      await server.connect(transport)
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
  return new Response(null, {
    status: 405,
    headers: { Allow: "POST", "Cache-Control": "no-store" },
  })
}

export { GET as DELETE }
