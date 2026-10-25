"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { authClient } from "@/lib/auth/auth-client"

export function AccountSwitchButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)
  async function switchAccount() {
    setPending(true)
    setError(false)
    try {
      const result = await authClient.signOut()
      if (result.error) throw new Error("Sign-out failed")
      router.replace("/auth/signin")
      router.refresh()
    } catch {
      setError(true)
      setPending(false)
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={switchAccount}
        disabled={pending}
        className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:border-zinc-700"
      >
        {pending ? "Signing out…" : "Use another account"}
      </button>
      {error ? (
        <ErrorBanner>Could not sign out. Please try again.</ErrorBanner>
      ) : null}
    </div>
  )
}
