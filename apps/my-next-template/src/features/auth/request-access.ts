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
        message: "Sign in with a verified Google account to request access.",
      }
    if (!submitAccessRequestSchema.safeParse(input).success)
      return { status: "error", message: "Invalid request." }
    if (await dependencies.getRole(email.data))
      return {
        status: "error",
        message: "Your account already has access. Return to the home page.",
      }
    await dependencies.submit(email.data)
    return {
      status: "success",
      message: "Request sent. An administrator needs to review it.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not send the request. Please try again.",
    }
  }
}
