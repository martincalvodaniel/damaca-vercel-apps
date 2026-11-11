import { headers } from "next/headers"
import { getAuth } from "@/lib/auth"
import { listCaptures } from "@/lib/captures"
import { signIn, signOut } from "./actions"
import { CapturePanel } from "./capture-panel"

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>
}) {
  const [requestHeaders, query] = await Promise.all([headers(), searchParams])
  const session = await getAuth().api.getSession({ headers: requestHeaders })

  return (
    <main className={session ? "signed-in" : undefined}>
      <div className="masthead">
        <span className="mark" aria-hidden="true">
          d.
        </span>
        <span>Damaca / Lab</span>
      </div>
      <section aria-label="Proofs of concept">
        <p className="eyebrow">Proofs of concept</p>
        <h1>damaca-pocs</h1>
        {session ? null : (
          <p className="intro">
            A place to try out ideas and see which ones are worth building.
          </p>
        )}
        {query.auth === "error" && !session && (
          <p role="alert">Google sign-in could not be completed. Try again.</p>
        )}
        {session ? (
          <>
            <p className="account">Signed in as {session.user.email}</p>
            <CapturePanel entries={await listCaptures(session.user.id)} />
            <form action={signOut}>
              <button type="submit">Sign out</button>
            </form>
          </>
        ) : (
          <form action={signIn}>
            <button type="submit">
              Continue with Google <span aria-hidden="true">↗</span>
            </button>
          </form>
        )}
      </section>
      {session ? null : (
        <footer>
          <span className="dot" aria-hidden="true" /> Personal capture with
          Alexa and ChatGPT
        </footer>
      )}
    </main>
  )
}
