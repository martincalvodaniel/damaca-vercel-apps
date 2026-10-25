import { HistoryScreen } from "@/features/history/components/history-screen"
import { getIdentity } from "@/lib/auth/identity"

export default async function HistoryPage() {
  await getIdentity().requireAccess()
  return <HistoryScreen />
}
