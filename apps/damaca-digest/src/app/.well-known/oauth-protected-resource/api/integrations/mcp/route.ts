import { captureScope, getMcpUrls, readScope } from "@/lib/auth/mcp-config"

export const dynamic = "force-dynamic"

export function GET() {
  const { issuer, resource } = getMcpUrls()
  return Response.json({
    resource,
    authorization_servers: [issuer],
    scopes_supported: [captureScope, readScope],
    bearer_methods_supported: ["header"],
  })
}
