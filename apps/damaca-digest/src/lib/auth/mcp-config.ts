import "server-only"

import { getAuthBaseUrl } from "@/config/env"

export const captureScope = "articles:write"
export const authPath = "/api/auth"
export const mcpPath = "/api/integrations/mcp"

export function getMcpUrls() {
  const base = new URL(getAuthBaseUrl()).origin
  return {
    issuer: `${base}${authPath}`,
    resource: `${base}${mcpPath}`,
    metadata: `${base}/.well-known/oauth-protected-resource${mcpPath}`,
  }
}
