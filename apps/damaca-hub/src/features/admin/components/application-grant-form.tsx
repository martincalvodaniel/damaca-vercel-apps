"use client"

import { useActionState, useId } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { changeHubAccess } from "@/features/hub/actions"
import type { AccessActionState } from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function ApplicationGrantForm({
  appId,
  email,
}: {
  appId: string
  email?: string
}) {
  const [state, action, pending] = useActionState(changeHubAccess, initialState)
  const emailId = useId()
  const operation = email ? "revoke" : "grant"
  return (
    <form action={action} className="flex min-w-0 flex-wrap items-end gap-2">
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="operation" value={operation} />
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <label
          htmlFor={emailId}
          className="flex min-w-0 flex-col gap-1 text-xs font-medium"
        >
          Grant to email
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="user@example.com"
            className="min-h-11 w-full min-w-48 rounded-lg border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700"
          />
        </label>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-label={email ? `Revoke ${appId} access for ${email}` : undefined}
        className={`min-h-11 rounded-lg px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${email ? "border border-zinc-300 dark:border-zinc-700" : "bg-emerald-700 text-white hover:bg-emerald-800"}`}
      >
        {pending ? "Saving…" : email ? "Revoke" : "Grant access"}
      </button>
      {state.status === "error" ? (
        <ErrorBanner>{state.message}</ErrorBanner>
      ) : null}
      {state.status === "success" ? (
        <span
          role="status"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        >
          {state.message}
        </span>
      ) : null}
    </form>
  )
}
