import { redirect } from "next/navigation"
import { ErrorBanner } from "@/components/ui/error-banner"
import { AccessRequestCard } from "@/features/auth/components/access-request-card"
import {
  getAuthorizedSession,
  requireVerifiedSession,
} from "@/lib/auth/session"
import { getAccessRequestStatus } from "@/lib/db/user-access"

export async function AccessRequestScreen() {
  const session = await requireVerifiedSession()
  if (await getAuthorizedSession()) redirect("/")
  try {
    return (
      <AccessRequestCard
        email={session.user.email}
        status={await getAccessRequestStatus(session.user.email)}
      />
    )
  } catch {
    return (
      <ErrorBanner>Could not load your request. Please try again.</ErrorBanner>
    )
  }
}
