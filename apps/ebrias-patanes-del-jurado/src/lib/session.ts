import "server-only"

import { cookies, headers } from "next/headers"
import { cache } from "react"
import { memberCollection } from "@/features/members/directory"
import { getAccessRole } from "@/lib/admission"
import { getAuth } from "@/lib/auth"

export const memberViewCookie = "ebrias-member-view"

export const getAuthorizedUser = cache(async () => {
  try {
    const auth = await getAuth()
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return null

    const { user } = session
    const role = await getAccessRole(user)
    if (!role) return null
    const isAccountAdmin = role === "admin"
    const memberView =
      isAccountAdmin &&
      (await cookies()).get(memberViewCookie)?.value === user.id
    return {
      ...user,
      role: memberView ? ("member" as const) : role,
      isAccountAdmin,
      memberView,
    }
  } catch {
    return null
  }
})

export const canManageAttendance = cache(async () => {
  const user = await getAuthorizedUser()
  return Boolean(
    user &&
      (user.role === "admin" ||
        (await memberCollection().findOne({
          email: user.email.trim().toLowerCase(),
        })))
  )
})
