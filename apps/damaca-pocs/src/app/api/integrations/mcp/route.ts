import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createCaptureServer } from "@/lib/capture-tools"
import { saveCapture } from "@/lib/captures"
import {
  captureScope,
  getChatGptClient,
  getMcpUrls,
} from "@/lib/chatgpt-config"

export const runtime = "nodejs"

const { verifyAccessTokenRequest } = oauthProviderResourceClient().getActions()

export async function POST(request: Request) {
  const client = getChatGptClient()
  if (!client) return new Response(null, { status: 503 })

  const { issuer, resource, metadata } = getMcpUrls()
  const origin = request.headers.get("origin")
  if (
    origin &&
    origin !== "https://chatgpt.com" &&
    origin !== new URL(resource).origin
  ) {
    return new Response(null, { status: 403 })
  }

  const unauthorized = () =>
    new Response(null, {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": `Bearer resource_metadata="${metadata}", scope="${captureScope}"`,
      },
    })

  let ownerId: string
  try {
    const claims = await verifyAccessTokenRequest(request, {
      jwksUrl: `${issuer}/jwks`,
      verifyOptions: {
        issuer,
        audience: resource,
        requiredClaims: ["exp", "sub"],
      },
      requiredScopes: [captureScope],
    })
    if (claims.client_id !== client.id || !claims.sub) return unauthorized()
    ownerId = claims.sub
  } catch {
    return unauthorized()
  }

  const server = createCaptureServer((entry) => saveCapture(ownerId, entry))
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
    maxRequestBodySize: 131_072,
  })
  await server.connect(transport)
  try {
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } })
}

export { GET as DELETE }
