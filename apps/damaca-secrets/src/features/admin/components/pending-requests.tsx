import Link from "next/link"
import { RequestReviewForm } from "@/features/admin/components/request-review-form"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import type { AccessRequestPage } from "@/types/access"

export async function PendingRequests({
  requests,
  hasCursor,
}: {
  requests: AccessRequestPage
  hasCursor: boolean
}) {
  const t = messages[await getLocale()]
  return (
    <section aria-label={t.pendingRequests} className="min-w-0">
      <h2 className="mb-3 text-lg font-semibold">{t.pendingRequests}</h2>
      {requests.entries.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {hasCursor ? t.noMoreRequests : t.noPendingRequests}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.entries.map((request) => (
            <li
              key={request.requestId}
              className="grid min-w-0 gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="break-all text-sm font-medium">{request.email}</p>
              <RequestReviewForm request={request} />
            </li>
          ))}
        </ul>
      )}
      <nav aria-label={t.requestPages} className="mt-3 flex flex-wrap gap-3">
        {hasCursor ? (
          <Link
            href="/admin"
            className="min-h-9 rounded px-2 py-1 text-sm underline focus-visible:outline-2"
          >
            {t.firstRequests}
          </Link>
        ) : null}
        {requests.nextCursor ? (
          <Link
            href={`/admin?requestsAfter=${encodeURIComponent(requests.nextCursor)}`}
            className="min-h-9 rounded px-2 py-1 text-sm underline focus-visible:outline-2"
          >
            {t.nextRequests}
          </Link>
        ) : null}
      </nav>
    </section>
  )
}
