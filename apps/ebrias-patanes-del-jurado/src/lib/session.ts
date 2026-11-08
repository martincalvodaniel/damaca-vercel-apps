import "server-only"

import { headers } from "next/headers"
import { cache } from "react"
import { getAccessRole } from "@/lib/admission"
import { getAuth } from "@/lib/auth"

export const getAuthorizedUser = cache(async () => {
  try {
    const session = await getAuth().api.getSession({ headers: await headers() })
    if (!session) return null

    const { user } = session
    const role = await getAccessRole(user)
    return role ? { ...user, role } : null
  } catch {
    return null
  }
})
