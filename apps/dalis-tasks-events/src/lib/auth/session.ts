import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { auth, identity } from "@/lib/auth/auth"
import { authorizePersistedSession } from "@/lib/auth/authorized-session"

async function readCurrentAccess() {
  if (process.env.RUN_NEXT_SYNC_TESTS !== "1") return identity.getAccess()

  // The isolated sync fixture proves session and data isolation without a live Hub deployment.
  const { getNextSyncTestConfig } = await import("@/config/next-sync-test")
  getNextSyncTestConfig()
  return "approved" as const
}

export async function getAuthorizedSessionFromHeaders(
  requestHeaders: Headers,
  readSession: typeof auth.api.getSession = auth.api.getSession,
  readAccess: typeof readCurrentAccess = readCurrentAccess
) {
  // Authorization must read persisted state even if cookie caching is enabled later.
  // Rendering a Server Component must not renew sessions or mutate cookies.
  const session = await readSession({
    headers: requestHeaders,
    query: { disableCookieCache: true, disableRefresh: true },
  })
  const authorized = authorizePersistedSession(session)
  if (!authorized || (await readAccess()) !== "approved") return null
  return authorized
}

export const getAuthorizedSession = cache(async () =>
  getAuthorizedSessionFromHeaders(await headers())
)

export async function requireAuthorizedSession() {
  await identity.requireAccess()
  const session = await getAuthorizedSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return session
}
