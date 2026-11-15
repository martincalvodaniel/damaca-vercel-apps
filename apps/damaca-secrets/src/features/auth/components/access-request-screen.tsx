import { redirect } from "next/navigation"
import { ErrorBanner } from "@/components/ui/error-banner"
import { AccessRequestCard } from "@/features/auth/components/access-request-card"
import { OfflineSessionCleanup } from "@/features/offline/offline-session-cleanup"
import {
  getAuthorizedSession,
  requireVerifiedSession,
} from "@/lib/auth/session"
import { getAccessRequestStatus } from "@/lib/db/user-access"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"

export async function AccessRequestScreen() {
  const t = messages[await getLocale()]
  const session = await requireVerifiedSession()
  if (await getAuthorizedSession()) redirect("/")
  const request = await getAccessRequestStatus(session.user.email)
    .then((status) => ({ status }))
    .catch(() => undefined)

  return (
    <>
      <OfflineSessionCleanup />
      {request ? (
        <AccessRequestCard email={session.user.email} status={request.status} />
      ) : (
        <ErrorBanner>{t.loadRequestFailed}</ErrorBanner>
      )}
    </>
  )
}
