import { AppShell } from "@/components/shared/app-shell"
import {
  filterAccountKey,
  readRememberedFilters,
} from "@/features/filters/filter-cookies"
import { requireAuthorizedSession } from "@/lib/auth/session"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireAuthorizedSession()

  const accountKey = filterAccountKey(session.user.id)
  const [library, topics] = await Promise.all([
    readRememberedFilters(accountKey, "/"),
    readRememberedFilters(accountKey, "/topics"),
  ])

  return (
    <AppShell
      filterDestinations={{
        "/": library || undefined,
        "/topics": topics || undefined,
      }}
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
    >
      {children}
    </AppShell>
  )
}
