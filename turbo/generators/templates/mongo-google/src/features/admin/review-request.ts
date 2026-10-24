import "server-only"

import { resolveAccessRequestSchema } from "@/schemas/user-access"
import type { AccessActionState, AccessRole } from "@/types/access"

interface ReviewRequestDependencies {
  getActorRole: () => Promise<AccessRole | null>
  isAdminEmail: (email: string) => boolean
  resolve: (
    email: string,
    requestId: string,
    decision: "approve" | "reject"
  ) => Promise<boolean>
}

export async function reviewAccessRequest(
  input: unknown,
  dependencies: ReviewRequestDependencies
): Promise<AccessActionState> {
  try {
    if ((await dependencies.getActorRole()) !== "admin")
      return {
        status: "error",
        message: "You do not have administrator permissions.",
      }
    const parsed = resolveAccessRequestSchema.safeParse(input)
    if (!parsed.success)
      return {
        status: "error",
        message: "Invalid decision. Refresh the list.",
      }
    const { email, requestId, decision } = parsed.data
    if (dependencies.isAdminEmail(email))
      return {
        status: "error",
        message: "Administrators are managed through ALLOWED_EMAILS.",
      }
    if (!(await dependencies.resolve(email, requestId, decision)))
      return {
        status: "error",
        message:
          "This request has changed. Refresh the list before reviewing it.",
      }
    return {
      status: "success",
      message:
        decision === "approve"
          ? "Request approved. User access granted."
          : "Request rejected.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not review the request. Please try again.",
    }
  }
}
