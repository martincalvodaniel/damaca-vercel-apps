import { getMcpUrls } from "@/lib/auth/mcp-config"
import { menuReadScope } from "@/lib/auth/mcp-paths"

export function GET() {
  const { issuer, resource } = getMcpUrls()
  return Response.json(
    {
      resource,
      authorization_servers: [issuer],
      scopes_supported: [menuReadScope],
      bearer_methods_supported: ["header"],
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
