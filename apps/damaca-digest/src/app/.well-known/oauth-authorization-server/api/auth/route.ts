import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"
import { getAuth } from "@/lib/auth/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const auth = await getAuth()
    return await oauthProviderAuthServerMetadata(auth)(request)
  } catch {
    return new Response(null, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
