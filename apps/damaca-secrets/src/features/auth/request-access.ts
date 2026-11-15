import "server-only"

import {
  accessEmailSchema,
  submitAccessRequestSchema,
} from "@/schemas/user-access"
import type { AccessActionState, AccessRole } from "@/types/access"

interface RequestAccessDependencies {
  getVerifiedEmail: () => Promise<string | null>
  getRole: (email: string) => Promise<AccessRole | null>
  submit: (email: string) => Promise<void>
}

export async function requestAccess(
  input: unknown,
  dependencies: RequestAccessDependencies
): Promise<AccessActionState> {
  try {
    const email = accessEmailSchema.safeParse(
      await dependencies.getVerifiedEmail()
    )
    if (!email.success)
      return {
        status: "error",
        code: "verifiedGoogleRequired",
      }
    if (!submitAccessRequestSchema.safeParse(input).success)
      return { status: "error", code: "invalidRequest" }
    if (await dependencies.getRole(email.data))
      return {
        status: "error",
        code: "alreadyAuthorized",
      }
    await dependencies.submit(email.data)
    return {
      status: "success",
      code: "requestSent",
    }
  } catch {
    return {
      status: "error",
      code: "sendRequestFailed",
    }
  }
}
