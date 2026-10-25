import "server-only"

import { getAuthEnv } from "@/config/env"
import { isEmailAllowed, parseAllowedEmails } from "@/lib/auth/allowed-emails"

const adminEmails = parseAllowedEmails(getAuthEnv().allowedEmails)

export function isAdminEmail(email: string): boolean {
  return isEmailAllowed(email, adminEmails)
}
