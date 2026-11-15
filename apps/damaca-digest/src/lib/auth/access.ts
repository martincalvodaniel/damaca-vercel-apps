import "server-only"

import { getAuthEnv } from "@/config/env"
import { resolveAccessRole } from "@/lib/auth/access-policy"
import { isEmailAllowed, parseAllowedEmails } from "@/lib/auth/allowed-emails"
import { hasUserAccess } from "@/lib/db/user-access"

const adminEmails = parseAllowedEmails(getAuthEnv().allowedEmails)

export function isAdminEmail(email: string): boolean {
  return isEmailAllowed(email, adminEmails)
}

export async function getAccessRole(email: string) {
  return resolveAccessRole(email, { adminEmails, hasUserAccess })
}
