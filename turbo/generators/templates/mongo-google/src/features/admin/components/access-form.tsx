"use client"

import { useActionState, useId } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { changeUserAccess } from "@/features/admin/actions"
import type { AccessActionState } from "@/types/access"

interface AccessFormProps {
  email?: string
}

const initialState: AccessActionState = { status: "idle", message: "" }

export function AccessForm({ email }: AccessFormProps) {
  const [state, action, pending] = useActionState(
    changeUserAccess,
    initialState
  )
  const emailId = useId()
  const isRevoke = email !== undefined

  return (
    <form action={action} className="flex min-w-0 flex-col gap-3">
      <input
        type="hidden"
        name="operation"
        value={isRevoke ? "revoke" : "grant"}
      />
      {isRevoke ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor={emailId} className="text-sm font-medium">
            Google email address
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="user@example.com"
            className="min-h-11 min-w-0 rounded-lg border border-zinc-300 bg-transparent px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-zinc-700"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        aria-label={isRevoke ? `Revoke access for ${email}` : undefined}
        className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {pending ? "Saving…" : isRevoke ? "Revoke access" : "Grant access"}
      </button>
      {state.status === "error" ? (
        <ErrorBanner>{state.message}</ErrorBanner>
      ) : null}
      {state.status === "success" ? (
        <p
          role="status"
          className="text-sm text-emerald-700 dark:text-emerald-400"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
