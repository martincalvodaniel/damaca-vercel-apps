"use client"

import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { createAuthClient } from "better-auth/react"
import { useCallback, useState } from "react"

const authClient = createAuthClient({ plugins: [oauthProviderClient()] })

export function ConnectCard({
  step,
  permissions = [],
}: {
  step: "sign-in" | "consent"
  permissions?: string[]
}) {
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
    <main className="grid min-h-screen place-items-center p-4">
      <section className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
        <h1 className="text-xl font-semibold">Connect Damaca Digest</h1>
        <p>
          {step === "sign-in"
            ? "Sign in to connect ChatGPT to your Damaca Digest account."
            : "Allow the requested ChatGPT access to Damaca Digest."}
        </p>
        {step === "consent" && permissions.length > 0 ? (
          <ul className="list-disc space-y-1 ps-5 text-sm">
            {permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        ) : null}
        <button
          className="mr-2 min-h-11 rounded-lg border border-zinc-400 px-4"
          type="button"
          disabled={pending}
          onClick={accept}
        >
          {step === "sign-in" ? "Continue with Google" : "Allow"}
        </button>
        {step === "consent" ? (
          <button
            className="mr-2 min-h-11 rounded-lg border border-zinc-400 px-4"
            type="button"
            disabled={pending}
            onClick={deny}
          >
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
