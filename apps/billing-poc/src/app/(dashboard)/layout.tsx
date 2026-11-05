import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserThemeProvider } from "@/features/settings/components/UserThemeProvider"
import { auth } from "@/lib/auth/auth"
import { MongoUserPreferencesRepository } from "@/lib/db/repositories/mongo-user-preferences-repository"
import { isEmailAllowed } from "@/lib/domain/services/auth"
import {
  getUserPreferenceKey,
  readUserPreferences,
} from "@/lib/domain/services/user-preferences"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user || !isEmailAllowed(session.user.email ?? "")) {
    redirect("/auth/signin")
  }

  const preferences = await readUserPreferences(
    new MongoUserPreferencesRepository(),
    session.user.email
  )

  return (
    <UserThemeProvider
      key={getUserPreferenceKey(session.user.email)}
      userKey={getUserPreferenceKey(session.user.email)}
      initialPreferences={preferences}
    >
      {children}
    </UserThemeProvider>
  )
}
