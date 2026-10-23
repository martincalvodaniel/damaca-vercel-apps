import { isEmailAllowed } from "@/lib/auth/allowed-emails"
import { accessEmailSchema } from "@/schemas/user-access"
import type { AccessRole } from "@/types/access"

interface AccessPolicy {
  adminEmails: ReadonlySet<string>
  hasUserAccess: (email: string) => Promise<boolean>
}

export async function resolveAccessRole(
  email: string,
  policy: AccessPolicy
): Promise<AccessRole | null> {
  const parsed = accessEmailSchema.safeParse(email)
  if (!parsed.success) return null
  if (isEmailAllowed(parsed.data, policy.adminEmails)) return "admin"
  return (await policy.hasUserAccess(parsed.data)) ? "user" : null
}
