"use server"

import { revalidatePath } from "next/cache"
import { isAdminEmail } from "@/lib/auth/access"
import { getVerifiedSession } from "@/lib/auth/session"
import {
  changeApplicationAccess,
  isPublicApplication,
  listApplications,
  resolveApplicationRequest,
  saveApplication,
  submitApplicationRequest,
} from "@/lib/db/hub"
import { createOidcClient, updateOidcClient } from "@/lib/db/oidc-clients"
import {
  applicationAccessMutationSchema,
  applicationMutationSchema,
  applicationRequestMutationSchema,
  applicationRequestReviewSchema,
} from "@/schemas/hub"
import { type OidcActionState, oidcClientMutationSchema } from "@/schemas/oidc"
import type { AccessActionState } from "@/types/access"

const invalidState: AccessActionState = {
  status: "error",
  message: "The request is invalid. Refresh the page and try again.",
}

async function requireAdministrator() {
  try {
    const session = await getVerifiedSession()
    if (!session || !isAdminEmail(session.user.email)) return null
    return session
  } catch {
    return null
  }
}

export async function requestApplicationAccess(
  _previous: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const parsed = applicationRequestMutationSchema.safeParse({
    appId: formData.get("appId"),
    operation: formData.get("operation"),
  })
  if (!parsed.success) return invalidState
  let session: Awaited<ReturnType<typeof getVerifiedSession>>
  try {
    session = await getVerifiedSession()
  } catch {
    return {
      status: "error",
      message:
        "Could not verify your Google account. Please refresh and try again.",
    }
  }
  if (!session)
    return {
      status: "error",
      message: "Sign in with Google to request access.",
    }
  if (isAdminEmail(session.user.email)) {
    return { status: "success", message: "Administrators already have access." }
  }
  try {
    const application = (await listApplications()).find(
      (entry) => entry.id === parsed.data.appId && entry.active
    )
    if (!application)
      return { status: "error", message: "This application is unavailable." }
    if (application.publicAccess)
      return { status: "error", message: "This application is public." }
    const result = await submitApplicationRequest(
      application.id,
      session.user.email
    )
    revalidatePath("/")
    if (result.status === "approved") {
      return {
        status: "success",
        message: "You already have access to this application.",
      }
    }
    return {
      status: "success",
      message: result.created
        ? "Access request sent for review."
        : "A request is already awaiting review.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not send the request. Please try again.",
    }
  }
}

export async function saveHubApplication(
  _previous: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const session = await requireAdministrator()
  if (!session)
    return { status: "error", message: "Administrator access is required." }
  const parsed = applicationMutationSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!parsed.success) return invalidState
  try {
    await saveApplication(parsed.data)
    revalidatePath("/")
    revalidatePath("/admin")
    return { status: "success", message: "Application details saved." }
  } catch {
    return {
      status: "error",
      message: "Could not save this application. Please try again.",
    }
  }
}

export async function changeHubAccess(
  _previous: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const session = await requireAdministrator()
  if (!session)
    return { status: "error", message: "Administrator access is required." }
  const parsed = applicationAccessMutationSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!parsed.success) return invalidState
  if (isAdminEmail(parsed.data.email)) {
    return {
      status: "error",
      message: "Administrator access is managed through ALLOWED_EMAILS.",
    }
  }
  try {
    const changed = await changeApplicationAccess(
      parsed.data.appId,
      parsed.data.email,
      parsed.data.operation,
      session.user.email
    )
    if (!changed) {
      return {
        status: "error",
        message: "No current access grant was found for this account.",
      }
    }
    revalidatePath("/")
    revalidatePath("/admin")
    return {
      status: "success",
      message:
        parsed.data.operation === "grant"
          ? "Application access granted."
          : "Application access revoked.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not update access. Please try again.",
    }
  }
}

export async function reviewHubRequest(
  _previous: AccessActionState,
  formData: FormData
): Promise<AccessActionState> {
  const session = await requireAdministrator()
  if (!session)
    return { status: "error", message: "Administrator access is required." }
  const parsed = applicationRequestReviewSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!parsed.success) return invalidState
  try {
    const resolved = await resolveApplicationRequest(
      parsed.data.appId,
      parsed.data.email,
      parsed.data.requestId,
      parsed.data.decision,
      session.user.email
    )
    if (!resolved)
      return {
        status: "error",
        message: "This request has changed. Refresh before reviewing it.",
      }
    revalidatePath("/")
    revalidatePath("/admin")
    return {
      status: "success",
      message:
        parsed.data.decision === "approve"
          ? "Request approved."
          : "Request rejected.",
    }
  } catch {
    return {
      status: "error",
      message: "Could not review this request. Please try again.",
    }
  }
}

export async function manageHubOidcClient(
  _previous: OidcActionState,
  formData: FormData
): Promise<OidcActionState> {
  const session = await requireAdministrator()
  if (!session)
    return { status: "error", message: "Administrator access is required." }
  const parsed = oidcClientMutationSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!parsed.success)
    return { status: "error", message: "The OIDC client details are invalid." }
  const input = parsed.data
  if (isPublicApplication(input.appId))
    return {
      status: "error",
      message: "Public applications cannot have OIDC clients.",
    }
  try {
    const application = (await listApplications()).find(
      (entry) => entry.id === input.appId && entry.active
    )
    if (!application)
      return { status: "error", message: "This application is unavailable." }
    if (input.operation === "create") {
      const client = await createOidcClient({
        appId: input.appId,
        environment: input.environment,
        redirectUri: input.redirectUri ?? "",
      })
      revalidatePath("/admin")
      return {
        status: "success",
        message:
          "OIDC client created. Copy its secret now; it will not be shown again.",
        clientSecret: client.clientSecret,
      }
    }
    const changed = await updateOidcClient({
      appId: input.appId,
      environment: input.environment,
      clientId: input.clientId ?? "",
      revision: input.revision,
      operation: input.operation,
      redirectUri: input.redirectUri,
    })
    if (!changed)
      return {
        status: "error",
        message:
          "This client changed in another session. Refresh and try again.",
      }
    revalidatePath("/admin")
    return {
      status: "success",
      message: changed.clientSecret
        ? "Secret rotated and existing tokens revoked. Copy the new secret now."
        : input.operation === "disable"
          ? "Client disabled and existing tokens revoked."
          : input.operation === "enable"
            ? "Client enabled."
            : "Callback saved.",
      ...(changed.clientSecret ? { clientSecret: changed.clientSecret } : {}),
    }
  } catch {
    return {
      status: "error",
      message: "Could not update this OIDC client. Refresh and try again.",
    }
  }
}
