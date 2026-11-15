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
        code: "adminRequired",
      }
    const parsed = resolveAccessRequestSchema.safeParse(input)
    if (!parsed.success)
      return {
        status: "error",
        code: "invalidDecision",
      }
    const { email, requestId, decision } = parsed.data
    if (dependencies.isAdminEmail(email))
      return {
        status: "error",
        code: "adminManagedEnvironment",
      }
    if (!(await dependencies.resolve(email, requestId, decision)))
      return {
        status: "error",
        code: "requestChanged",
      }
    return {
      status: "success",
      code: decision === "approve" ? "requestApproved" : "requestRejected",
    }
  } catch {
    return {
      status: "error",
      code: "reviewFailed",
    }
  }
}
