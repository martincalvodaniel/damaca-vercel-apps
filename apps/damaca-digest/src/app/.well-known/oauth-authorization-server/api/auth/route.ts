import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider"
import { auth } from "@/lib/auth/auth"

export const dynamic = "force-dynamic"

export function GET(request: Request) {
  return oauthProviderAuthServerMetadata(auth)(request)
}
