"use client"

import { useActionState } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { IconButton } from "@/components/ui/icon-button"
import { reviewRequest } from "@/features/admin/actions"
import { useLocale } from "@/lib/i18n/client"
import { formatMessage } from "@/lib/i18n/messages"
import type { AccessActionState, AccessRequestEntry } from "@/types/access"

const initialState: AccessActionState = { status: "idle" }

export function RequestReviewForm({
  request,
}: {
  request: AccessRequestEntry
}) {
  const { t } = useLocale()
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
          label={formatMessage(t.approveRequestFrom, { email: request.email })}
          tone="primary"
        />
        <IconButton
          type="submit"
          name="decision"
          value="reject"
          disabled={pending}
          icon="close"
          label={formatMessage(t.rejectRequestFrom, { email: request.email })}
          tone="danger"
        />
      </div>
      {pending ? (
        <p role="status" className="text-sm">
          {t.saving}
        </p>
      ) : null}
      {state.status === "error" ? (
        <ErrorBanner>{t[state.code]}</ErrorBanner>
      ) : null}
    </form>
  )
}
