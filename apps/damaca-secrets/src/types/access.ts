import type { MessageKey } from "@/lib/i18n/messages"

export type AccessRole = "admin" | "user"

export interface UserAccessEntry {
  email: string
  createdAt: string
}

export interface UserAccessPage {
  entries: UserAccessEntry[]
  nextCursor: string | null
}

export type AccessActionState =
  | { status: "idle" }
  | { status: "success" | "error"; code: MessageKey }

export type AccessRequestStatus = "pending" | "rejected" | "approved"

export interface AccessRequestEntry {
  email: string
  requestId: string
  requestedAt: string
}

export interface AccessRequestPage {
  entries: AccessRequestEntry[]
  nextCursor: string | null
}
