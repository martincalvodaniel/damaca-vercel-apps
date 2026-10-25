"use client"

import { useCallback, useState } from "react"
import { authClient } from "@/lib/auth/auth-client"

export function ConsentCard() {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const decide = useCallback(async (accept: boolean) => {
    setPending(true)
    setFailed(false)
    try {
      const result = await authClient.oauth2.consent({ accept })
      if (result.error || !result.data?.url) throw new Error("Consent failed")
      window.location.assign(result.data.url)
    } catch {
      setPending(false)
      setFailed(true)
    }
  }, [])
  const accept = useCallback(() => decide(true), [decide])
  const reject = useCallback(() => decide(false), [decide])
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Continue to your application</h1>
      <p>
        Share your verified identity with this registered Damaca application.
        Application access still requires a current grant.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={accept}
        className="min-h-11 rounded-lg border p-3"
      >
        Continue
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={reject}
        className="min-h-11 rounded-lg border p-3"
      >
        Cancel
      </button>
      {failed ? (
        <p role="alert">
          Could not complete authorization. Please restart sign-in.
        </p>
      ) : null}
    </main>
  )
}
