import { AppShell } from "@/components/shared/app-shell"
import { requireVerifiedSession } from "@/lib/auth/session"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await requireVerifiedSession()

  return (
    <AppShell
      name={session.user.name}
      email={session.user.email}
      image={session.user.image}
    >
      {children}
    </AppShell>
  )
}
