import { headers } from "next/headers"
import { getAuth } from "@/lib/auth"
import { ConnectCard } from "../connect-card"

export default async function ConsentPage() {
  const requestHeaders = await headers()
  const session = await getAuth().api.getSession({ headers: requestHeaders })
  if (!session?.user.emailVerified) {
    return (
      <main>
        <section>
          Restart the connection from ChatGPT with a verified Google account.
        </section>
      </main>
    )
  }
  return <ConnectCard step="consent" />
}
