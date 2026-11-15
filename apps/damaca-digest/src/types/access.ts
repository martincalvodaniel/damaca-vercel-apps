export type AccessRole = "admin" | "user"

export interface UserAccessEntry {
  email: string
  createdAt: string
}

export interface UserAccessPage {
  entries: UserAccessEntry[]
  nextCursor: string | null
}

export interface AccessActionState {
  status: "idle" | "success" | "error"
  message: string
}

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
