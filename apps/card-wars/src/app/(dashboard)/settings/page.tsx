import { SettingsScreen } from "@/features/settings/components/settings-screen"
import { getIdentity } from "@/lib/auth/identity"

export default async function SettingsPage() {
  await getIdentity().requireAccess()
  return <SettingsScreen />
}
