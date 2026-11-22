import { headers } from "next/headers"
import { McpConnectCard } from "@/features/auth/components/mcp-connect-card"
import { getMcpAuth, hasMcpAccess } from "@/lib/auth/mcp-auth"

export default async function McpConsentPage() {
  const requestHeaders = await headers()
  const session = await getMcpAuth()
    .then((auth) => auth.api.getSession({ headers: requestHeaders }))
    .catch(() => null)
  return (
    <McpConnectCard
      step={session && hasMcpAccess(session.user) ? "consent" : "unavailable"}
    />
  )
}
