import Link from "next/link"
import { AccessForm } from "@/features/admin/components/access-form"
import { PendingRequests } from "@/features/admin/components/pending-requests"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import type { AccessRequestPage, UserAccessPage } from "@/types/access"

interface AdminPanelProps {
  users: UserAccessPage
  hasCursor: boolean
  requests: AccessRequestPage
  hasRequestsCursor: boolean
}

export async function AdminPanel({
  users,
  hasCursor,
  requests,
  hasRequestsCursor,
}: AdminPanelProps) {
  const t = messages[await getLocale()]
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-3 sm:gap-5 sm:p-6">
      <Link
        href="/"
        className="w-fit rounded text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {t.backHome}
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t.siteAdmin}</h1>
      </header>
      <PendingRequests requests={requests} hasCursor={hasRequestsCursor} />
      <section
        aria-label={t.grantAccess}
        className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-4 text-lg font-semibold">{t.grantAccess}</h2>
        <AccessForm />
      </section>
      <section aria-label={t.authorizedUsers} className="min-w-0">
        <h2 className="mb-3 text-lg font-semibold">{t.authorizedUsers}</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {t.revokeExplanation}
        </p>
        {users.entries.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            {hasCursor ? t.noMoreUsers : t.noUsers}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {users.entries.map((entry) => (
              <li
                key={entry.email}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="break-all text-sm font-medium">{entry.email}</p>
                <AccessForm email={entry.email} />
              </li>
            ))}
          </ul>
        )}
        <nav aria-label={t.userPages} className="mt-4 flex flex-wrap gap-4">
          {hasCursor ? (
            <Link
              href="/admin"
              className="min-h-9 rounded px-2 py-1 text-sm underline focus-visible:outline-2"
            >
              {t.firstPage}
            </Link>
          ) : null}
          {users.nextCursor ? (
            <Link
              href={`/admin?after=${encodeURIComponent(users.nextCursor)}`}
              className="min-h-9 rounded px-2 py-1 text-sm underline focus-visible:outline-2"
            >
              {t.nextPage}
            </Link>
          ) : null}
        </nav>
      </section>
    </main>
  )
}
