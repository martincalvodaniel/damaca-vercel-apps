import { captureScope, getMcpUrls } from "@/lib/chatgpt-config"

export const dynamic = "force-dynamic"

export function GET() {
  const { issuer, resource } = getMcpUrls()
  return Response.json({
    resource,
    authorization_servers: [issuer],
    scopes_supported: [captureScope],
    bearer_methods_supported: ["header"],
  })
}
