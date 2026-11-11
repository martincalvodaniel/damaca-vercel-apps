import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"
import { getAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export function GET(request: Request) {
  return oauthProviderAuthServerMetadata(getAuth())(request)
}
