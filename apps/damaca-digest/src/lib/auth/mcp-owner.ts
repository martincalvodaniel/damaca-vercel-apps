import "server-only"

import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client"
import { getChatGptClient } from "@/config/env"
import { getAccessRole } from "@/lib/auth/access"
import { getAuth } from "@/lib/auth/auth"
import { captureScope, getMcpUrls } from "@/lib/auth/mcp-config"

const { verifyAccessTokenRequest } = oauthProviderResourceClient().getActions()

export async function getMcpOwner(request: Request) {
  const client = getChatGptClient()
  if (!client) return { status: 503 } as const

  const { issuer, resource } = getMcpUrls()
  const origin = request.headers.get("origin")
  if (
    origin &&
    origin !== "https://chatgpt.com" &&
    origin !== new URL(resource).origin
  ) {
    return { status: 403 } as const
  }

  let subject: string
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
    if (claims.client_id !== client.id || !claims.sub)
      return { status: 401 } as const
    subject = claims.sub
  } catch {
    return { status: 401 } as const
  }

  const auth = await getAuth()
  const user = await (await auth.$context).internalAdapter.findUserById(subject)
  if (!user?.emailVerified || !(await getAccessRole(user.email)))
    return { status: 403 } as const
  return { status: 200, ownerId: user.id } as const
}
