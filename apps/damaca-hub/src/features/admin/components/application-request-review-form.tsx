"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { reviewHubRequest } from "@/features/hub/actions"
import type {
  AccessActionState,
  ApplicationAccessRequestEntry,
} from "@/types/access"

const initialState: AccessActionState = { status: "idle", message: "" }

export function ApplicationRequestReviewForm({
  request,
}: {
  request: ApplicationAccessRequestEntry
}) {
  const [state, action, pending] = useActionState(
    reviewHubRequest,
    initialState
  )
  return (
    <form action={action} className="flex flex-wrap gap-2">
      <input type="hidden" name="appId" value={request.appId} />
      <input type="hidden" name="email" value={request.email} />
      <input type="hidden" name="requestId" value={request.requestId} />
      <button
        type="submit"
        name="decision"
        value="approve"
        disabled={pending}
        className="min-h-11 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        type="submit"
        name="decision"
        value="reject"
        disabled={pending}
        className="min-h-11 rounded-lg border border-zinc-300 px-3 text-sm font-medium focus-visible:outline-2 disabled:opacity-60 dark:border-zinc-700"
      >
        Reject
      </button>
      {state.status === "error" ? (
        <ErrorBanner>{state.message}</ErrorBanner>
      ) : null}
      {state.status === "success" ? (
        <span role="status" className="sr-only">
          {state.message}
        </span>
      ) : null}
    </form>
  )
}
