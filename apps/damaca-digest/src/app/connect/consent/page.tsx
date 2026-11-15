import { getAuthorizedSession } from "@/lib/auth/session"
import { ConnectCard } from "../connect-card"

export default async function ConsentPage() {
  if (!(await getAuthorizedSession())) {
    return (
      <main className="mx-auto max-w-sm p-4">
        <h1 className="text-xl font-semibold">Digest access required</h1>
        <p>
          Restart the connection from ChatGPT with an authorized Google account.
        </p>
      </main>
    )
  }
  return <ConnectCard step="consent" />
}
