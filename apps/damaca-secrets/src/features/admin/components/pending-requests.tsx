import Link from "next/link"
import { RequestReviewForm } from "@/features/admin/components/request-review-form"
import type { AccessRequestPage } from "@/types/access"

export function PendingRequests({
  requests,
  hasCursor,
}: {
  requests: AccessRequestPage
  hasCursor: boolean
}) {
  return (
    <section aria-label="Pending requests" className="min-w-0">
      <h2 className="mb-3 text-lg font-semibold">Pending requests</h2>
      {requests.entries.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {hasCursor
            ? "There are no more requests on this page."
            : "There are no pending requests."}
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
      <nav aria-label="Request pages" className="mt-3 flex flex-wrap gap-3">
        {hasCursor ? (
          <Link
            href="/admin"
            className="min-h-11 rounded px-2 py-3 text-sm underline focus-visible:outline-2"
          >
            First requests
          </Link>
        ) : null}
        {requests.nextCursor ? (
          <Link
            href={`/admin?requestsAfter=${encodeURIComponent(requests.nextCursor)}`}
            className="min-h-11 rounded px-2 py-3 text-sm underline focus-visible:outline-2"
          >
            Next requests
          </Link>
        ) : null}
      </nav>
    </section>
  )
}
