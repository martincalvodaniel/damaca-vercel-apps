import { ErrorBanner } from "@/components/ui/error-banner"
import { ApplicationCard } from "@/features/home/components/application-card"
import { isAdminEmail } from "@/lib/auth/access"
import { getVerifiedSession } from "@/lib/auth/session"
import {
  getApplicationStatus,
  isPublicApplication,
  listApplications,
} from "@/lib/db/hub"
import type { ApplicationEntry, AppRequestStatus } from "@/types/access"

export async function HomeScreen() {
  const session = await getVerifiedSession()
  if (!session)
    return (
      <ErrorBanner>
        Sign in with a verified Google account to view the application
        directory.
      </ErrorBanner>
    )

  let applications: ApplicationEntry[]
  let statuses: Map<string, AppRequestStatus>
  try {
    ;[applications, statuses] = await Promise.all([
      listApplications(),
      getApplicationStatus(session.user.email),
    ])
  } catch {
    return (
      <ErrorBanner>
        The application directory is temporarily unavailable. Refresh to try
        again.
      </ErrorBanner>
    )
  }
  const isAdmin = isAdminEmail(session.user.email)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24 sm:px-8 md:py-10">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
          Damaca Hub
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your applications
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Open an application or request access. Each application manages access
          independently.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-2">
        {applications
          .filter((application) => application.active)
          .map((application) => (
            <li key={application.id}>
              <ApplicationCard
                application={{
                  ...application,
                  accessStatus: isAdmin
                    ? "approved"
                    : isPublicApplication(application.id)
                      ? null
                      : (statuses.get(application.id) ?? null),
                }}
                isAdmin={isAdmin}
              />
            </li>
          ))}
      </ul>
      {applications.every((application) => !application.active) ? (
        <p className="rounded-xl border border-zinc-200 p-5 text-sm dark:border-zinc-800">
          No applications are currently available.
        </p>
      ) : null}
    </main>
  )
}
