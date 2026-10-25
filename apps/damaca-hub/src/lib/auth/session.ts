import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { isAdminEmail } from "@/lib/auth/access"
import { auth } from "@/lib/auth/auth"

export const getVerifiedSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user.email || !session.user.emailVerified) {
    return null
  }

  return session
})

export async function requireAdminSession() {
  const session = await requireVerifiedSession()
  if (!isAdminEmail(session.user.email)) redirect("/")
  return { ...session, role: "admin" as const }
}

export async function requireVerifiedSession() {
  const session = await getVerifiedSession()
  if (!session) redirect("/auth/signin")
  return session
}
