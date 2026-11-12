"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { reviewRequest } from "@/features/admin/actions"
import type { AccessActionState, AccessRequestEntry } from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function RequestReviewForm({
  request,
}: {
  request: AccessRequestEntry
}) {
  const [state, action, pending] = useActionState(reviewRequest, initialState)
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="email" value={request.email} />
      <input type="hidden" name="requestId" value={request.requestId} />
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          name="decision"
          value="approve"
          disabled={pending}
          aria-label={`Approve request from ${request.email}`}
          className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          aria-label={`Reject request from ${request.email}`}
          className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:border-zinc-700"
        >
          Reject
        </button>
      </div>
      {pending ? (
        <p role="status" className="text-sm">
          Saving…
        </p>
      ) : null}
      {state.status === "error" ? (
        <ErrorBanner>{state.message}</ErrorBanner>
      ) : null}
    </form>
  )
}
