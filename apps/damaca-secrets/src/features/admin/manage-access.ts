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
        code: "adminRequired",
      }
    }
    const parsed = userAccessMutationSchema.safeParse(input)
    if (!parsed.success) {
      return {
        status: "error",
        code: "invalidAccessOperation",
      }
    }
    const { email, operation } = parsed.data
    if (dependencies.isAdminEmail(email)) {
      return {
        status: "error",
        code: "adminManaged",
      }
    }
    if (operation === "grant") await dependencies.grant(email)
    else await dependencies.revoke(email)
    return {
      status: "success",
      code: operation === "grant" ? "accessGranted" : "accessRevoked",
    }
  } catch {
    return {
      status: "error",
      code: "saveAccessFailed",
    }
  }
}
