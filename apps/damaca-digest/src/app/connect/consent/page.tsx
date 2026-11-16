import { captureScope, readScope } from "@/lib/auth/mcp-config"
import { getAuthorizedSession } from "@/lib/auth/session"
import { ConnectCard } from "../connect-card"

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string | string[] }>
}) {
  const [session, { scope }] = await Promise.all([
    getAuthorizedSession(),
    searchParams,
  ])
  if (!session) {
    return (
      <main className="mx-auto max-w-sm p-4">
        <h1 className="text-xl font-semibold">Digest access required</h1>
        <p>
          Restart the connection from ChatGPT with an authorized Google account.
        </p>
      </main>
    )
  }
  const scopes = typeof scope === "string" ? scope.split(/\s+/) : []
  const permissions = []
  if (scopes.includes(captureScope))
    permissions.push("Save articles in your private library.")
  if (scopes.includes(readScope))
    permissions.push("Search and read saved articles in your private library.")
  return <ConnectCard step="consent" permissions={permissions} />
}
