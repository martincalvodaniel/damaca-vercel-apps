import { ErrorBanner } from "@/components/ui/error-banner"
import { AdminPanel } from "@/features/admin/components/admin-panel"
import { requireAdminSession } from "@/lib/auth/session"
import { listAccessRequests, listUserAccess } from "@/lib/db/user-access"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import { userAccessQuerySchema } from "@/schemas/user-access"

interface AdminScreenProps {
  query: { after?: string | string[]; requestsAfter?: string | string[] }
}

export async function AdminScreen({ query }: AdminScreenProps) {
  const t = messages[await getLocale()]
  await requireAdminSession()
  const parsed = userAccessQuerySchema.safeParse(query)
  if (!parsed.success) {
    return <ErrorBanner>{t.invalidUserPage}</ErrorBanner>
  }
  try {
    const [users, requests] = await Promise.all([
      listUserAccess(parsed.data.after),
      listAccessRequests(parsed.data.requestsAfter),
    ])
    return (
      <AdminPanel
        users={users}
        hasCursor={parsed.data.after !== undefined}
        requests={requests}
        hasRequestsCursor={parsed.data.requestsAfter !== undefined}
      />
    )
  } catch {
    return <ErrorBanner>{t.loadUsersFailed}</ErrorBanner>
  }
}
