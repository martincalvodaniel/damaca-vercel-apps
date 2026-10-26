import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { isAdminEmail } from "@/lib/auth/access"
import { getHubAuth } from "@/lib/auth/auth"
import { getDatabase } from "@/lib/db/client"

export const getVerifiedSession = cache(async () => {
  const requestHeaders = await headers()
  await getDatabase()
  const session = await (await getHubAuth()).api.getSession({
    headers: requestHeaders,
  })

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
