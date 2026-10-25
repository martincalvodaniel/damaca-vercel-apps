"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { requestApplicationAccess } from "@/features/hub/actions"
import type { AccessActionState, AppRequestStatus } from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function AccessRequestForm({
  appId,
  status,
}: {
  appId: string
  status: AppRequestStatus | null
}) {
  const [state, action, pending] = useActionState(
    requestApplicationAccess,
    initialState
  )
  const canRequest =
    status === null || status === "rejected" || status === "revoked"
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="operation" value="request" />
      {canRequest ? (
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-emerald-800 underline decoration-emerald-400 underline-offset-4 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-950"
        >
          {pending
            ? "Sending…"
            : status === "rejected" || status === "revoked"
              ? "Request access again"
              : "Request access"}
        </button>
      ) : null}
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
