import { HomeScreen } from "@/features/home/components/home-screen"
import { getIdentity } from "@/lib/auth/identity"

export default async function HomePage() {
  await getIdentity().requireAccess()
  return <HomeScreen />
}
