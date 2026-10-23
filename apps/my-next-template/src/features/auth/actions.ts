"use server"

import { revalidatePath } from "next/cache"
import { requestAccess } from "@/features/auth/request-access"
import { getAccessRole } from "@/lib/auth/access"
import { getVerifiedSession } from "@/lib/auth/session"
import { submitAccessRequest } from "@/lib/db/user-access"
import type { AccessActionState } from "@/types/access"

export async function sendAccessRequest(
  _previous: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const result = await requestAccess(
    { operation: formData.get("operation") },
    {
      getVerifiedEmail: async () =>
        (await getVerifiedSession())?.user.email ?? null,
      getRole: getAccessRole,
      submit: submitAccessRequest,
    }
  )
  if (result.status === "success") revalidatePath("/auth/access")
  return result
}
