"use client"

import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { createAuthClient } from "better-auth/react"
import { useCallback, useState } from "react"

const authClient = createAuthClient({ plugins: [oauthProviderClient()] })

export function ConnectCard({ step }: { step: "sign-in" | "consent" }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const submit = useCallback(
    async (accept: boolean) => {
      setPending(true)
      setFailed(false)
      try {
        if (step === "sign-in") {
          const result = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
          })
          if (result.error || !result.data?.url)
            throw new Error("Sign-in failed")
          window.location.assign(result.data.url)
        } else {
          const result = await authClient.oauth2.consent({ accept })
          if (result.error || !result.data?.url)
            throw new Error("Consent failed")
          window.location.assign(result.data.url)
        }
      } catch {
        setPending(false)
        setFailed(true)
      }
    },
    [step]
  )

  const accept = useCallback(() => submit(true), [submit])
  const deny = useCallback(() => submit(false), [submit])

  return (
    <main>
      <section>
        <h1>Connect Damaca</h1>
        <p className="intro">
          {step === "sign-in"
            ? "Sign in to connect ChatGPT to your Damaca account."
            : "Allow ChatGPT to save links and conversation summaries in your private panel."}
        </p>
        <button type="button" disabled={pending} onClick={accept}>
          {step === "sign-in" ? "Continue with Google" : "Allow"}
        </button>
        {step === "consent" ? (
          <button type="button" disabled={pending} onClick={deny}>
            Deny
          </button>
        ) : null}
        {failed ? (
          <p role="alert">
            Could not connect. Restart the connection from ChatGPT.
          </p>
        ) : null}
      </section>
    </main>
  )
}
