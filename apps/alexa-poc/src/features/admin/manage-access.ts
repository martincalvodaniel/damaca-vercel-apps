import "server-only"

import { userAccessMutationSchema } from "@/schemas/user-access"
import type { AccessActionState, AccessRole } from "@/types/access"

interface AccessManagementDependencies {
  getActorRole: () => Promise<AccessRole | null>
  isAdminEmail: (email: string) => boolean
  grant: (email: string) => Promise<void>
  revoke: (email: string) => Promise<void>
}

export async function manageUserAccess(
  input: unknown,
  dependencies: AccessManagementDependencies
): Promise<AccessActionState> {
  try {
    if ((await dependencies.getActorRole()) !== "admin") {
      return {
        status: "error",
        message: "You do not have administrator permissions.",
      }
    }
    const parsed = userAccessMutationSchema.safeParse(input)
    if (!parsed.success) {
      return {
        status: "error",
        message: "Enter a valid email address and an allowed operation.",
      }
    }
    const { email, operation } = parsed.data
    if (dependencies.isAdminEmail(email)) {
      return {
        status: "error",
        message:
          "Administrators are managed through ALLOWED_EMAILS, not this list.",
      }
    }
    if (operation === "grant") await dependencies.grant(email)
    else await dependencies.revoke(email)
    return {
      status: "success",
      message:
        operation === "grant" ? "User access granted." : "User access revoked.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not save the change. Please try again.",
    }
  }
}
