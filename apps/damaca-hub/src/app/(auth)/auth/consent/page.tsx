import { ConsentCard } from "@/features/auth/components/consent-card"
import { requireVerifiedSession } from "@/lib/auth/session"

export default async function ConsentPage() {
  await requireVerifiedSession()
  return <ConsentCard />
}
