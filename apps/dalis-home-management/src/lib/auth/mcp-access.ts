import "server-only"

import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client"
import { getMcpAuth, hasMcpAccess } from "@/lib/auth/mcp-auth"
import { getMcpClients, getMcpUrls } from "@/lib/auth/mcp-config"
import { menuReadScope } from "@/lib/auth/mcp-paths"

const { verifyAccessTokenRequest } = oauthProviderResourceClient().getActions()

export async function getMcpAccessStatus(request: Request) {
  const clients = getMcpClients()
  if (clients.length === 0) return 503
  const { issuer, origin, resource } = getMcpUrls()
  const requestOrigin = request.headers.get("origin")
  if (
    requestOrigin &&
    requestOrigin !== "https://chatgpt.com" &&
    requestOrigin !== origin
  )
    return 403

  let subject: string
  try {
    const claims = await verifyAccessTokenRequest(request, {
      jwksUrl: `${issuer}/jwks`,
      verifyOptions: {
        issuer,
        audience: resource,
        requiredClaims: ["exp", "sub"],
      },
    })
    if (!claims.sub || !clients.some(({ id }) => id === claims.client_id))
      return 401
    if (
      typeof claims.scope !== "string" ||
      !claims.scope.split(/\s+/).includes(menuReadScope)
    )
      return 401
    subject = claims.sub
  } catch {
    return 401
  }

  const auth = await getMcpAuth()
  const user = await (await auth.$context).internalAdapter.findUserById(subject)
  return user && hasMcpAccess(user) ? 200 : 403
}
