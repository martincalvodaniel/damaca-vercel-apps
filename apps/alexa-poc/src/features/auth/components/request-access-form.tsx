"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { sendAccessRequest } from "@/features/auth/actions"
import type { AccessActionState } from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function RequestAccessForm() {
  const [state, action, pending] = useActionState(
    sendAccessRequest,
    initialState
  )
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="operation" value="request" />
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request access"}
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
