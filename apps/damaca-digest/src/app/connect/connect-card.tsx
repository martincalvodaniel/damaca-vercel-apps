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
    <main className="grid min-h-dvh place-items-center p-3 sm:p-6">
      <section className="digest-panel w-full max-w-sm space-y-3 rounded-2xl p-4 sm:space-y-4 sm:p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connect Damaca Digest
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {step === "sign-in"
            ? "Sign in to connect ChatGPT to your Damaca Digest account."
            : "Review the permissions ChatGPT is requesting."}
        </p>
        {step === "consent" && permissions.length > 0 ? (
          <ul className="list-disc space-y-1 ps-5 text-sm">
            {permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            className="min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
            type="button"
            disabled={pending}
            onClick={accept}
          >
            {step === "sign-in" ? "Continue with Google" : "Allow"}
          </button>
          {step === "consent" ? (
            <button
              className="digest-panel min-h-11 rounded-lg px-4 text-sm font-semibold hover:border-teal-600 disabled:opacity-60"
              type="button"
              disabled={pending}
              onClick={deny}
            >
              Deny
            </button>
          ) : null}
        </div>
        {failed ? (
          <p role="alert" className="text-sm">
            Could not connect. Restart the connection from ChatGPT.
          </p>
        ) : null}
      </section>
    </main>
  )
}
