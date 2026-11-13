"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
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
        <IconButton
          type="submit"
          name="decision"
          value="approve"
          disabled={pending}
          icon="check"
          label={`Approve request from ${request.email}`}
          tone="primary"
        />
        <IconButton
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          icon="close"
          label={`Reject request from ${request.email}`}
          tone="danger"
        />
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
