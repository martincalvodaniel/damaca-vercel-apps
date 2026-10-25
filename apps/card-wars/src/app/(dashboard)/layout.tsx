import { HubAccessBoundary } from "@damaca/identity/access-boundary"
import { AppShell } from "@/components/shared/app-shell"
import { getIdentity } from "@/lib/auth/identity"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js route configuration belongs beside its component.
export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getIdentity().requireAccess()
  return (
    <HubAccessBoundary>
      <AppShell>{children}</AppShell>
    </HubAccessBoundary>
  )
}
