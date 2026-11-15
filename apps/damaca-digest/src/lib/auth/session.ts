import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { getAccessRole } from "@/lib/auth/access"
import { auth } from "@/lib/auth/auth"

export const getVerifiedSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user.email || !session.user.emailVerified) {
    return null
  }

  return session
})

export const getAuthorizedSession = cache(async () => {
  const session = await getVerifiedSession()
  if (!session) return null
  const role = await getAccessRole(session.user.email)
  return role ? { ...session, role } : null
})

export async function requireAuthorizedSession() {
  const session = await getAuthorizedSession()

  if (!session) {
    redirect((await getVerifiedSession()) ? "/auth/access" : "/auth/signin")
  }

  return session
}

export async function requireAdminSession() {
  const session = await requireAuthorizedSession()
  if (session.role !== "admin") redirect("/")
  return session
}

export async function requireVerifiedSession() {
  const session = await getVerifiedSession()
  if (!session) redirect("/auth/signin")
  return session
}
