import Link from "next/link"
import { ErrorBanner } from "@/components/ui/error-banner"
import { ApplicationAdminCard } from "@/features/admin/components/application-admin-card"
import { requireAdminSession } from "@/lib/auth/session"
import { listApplicationAdminData } from "@/lib/db/hub"
import { listOidcClients } from "@/lib/db/oidc-clients"

export async function AdminScreen() {
  await requireAdminSession()
  try {
    const clients = await listOidcClients()
    const clientsByApp = new Map<string, typeof clients>()
    for (const client of clients) {
      const entries = clientsByApp.get(client.appId) ?? []
      entries.push(client)
      clientsByApp.set(client.appId, entries)
    }
    const applications = await listApplicationAdminData(clientsByApp)
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 pb-24 sm:px-8 md:py-10">
        <Link
          href="/"
          className="w-fit rounded text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Back to applications
        </Link>
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Damaca Hub
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Application access
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Administrators are configured in ALLOWED_EMAILS. Access is managed
            separately for each application.
          </p>
        </header>
        <ul className="flex flex-col gap-5">
          {applications.map((application) => (
            <li key={application.app.id}>
              <ApplicationAdminCard data={application} />
            </li>
          ))}
        </ul>
      </main>
    )
  } catch {
    return (
      <main className="mx-auto max-w-5xl p-4 sm:p-8">
        <ErrorBanner>
          Could not load application access data. Refresh to try again.
        </ErrorBanner>
      </main>
    )
  }
}
