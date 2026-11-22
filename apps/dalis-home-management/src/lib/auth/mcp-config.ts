import "server-only"

import { z } from "zod"
import { getAuthEnv, getMcpOAuthClientsConfig } from "@/config/env"
import { mcpAuthPath, mcpPath } from "@/lib/auth/mcp-paths"

const clientsSchema = z
  .array(
    z.strictObject({
      id: z.string().min(1),
      secret: z.string().min(32),
      redirectUri: z.url({ protocol: /^https$/ }),
    })
  )
  .nonempty()
  .refine(
    (clients) => new Set(clients.map(({ id }) => id)).size === clients.length
  )

export function getMcpClients() {
  const raw = getMcpOAuthClientsConfig()
  if (!raw) return []
  try {
    return clientsSchema.parse(JSON.parse(raw))
  } catch {
    throw new Error("Invalid MCP_OAUTH_CLIENTS configuration")
  }
}

export function getMcpUrls() {
  const origin = new URL(getAuthEnv().baseUrl).origin
  return {
    origin,
    issuer: `${origin}${mcpAuthPath}`,
    resource: `${origin}${mcpPath}`,
    metadata: `${origin}/.well-known/oauth-protected-resource${mcpPath}`,
  }
}
