import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"
import { getMcpAuth } from "@/lib/auth/mcp-auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const auth = await getMcpAuth()
    return await oauthProviderAuthServerMetadata(auth)(request)
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
