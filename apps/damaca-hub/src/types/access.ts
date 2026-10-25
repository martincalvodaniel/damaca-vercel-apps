export type AppRequestStatus = "pending" | "rejected" | "approved" | "revoked"

export interface ApplicationEntry {
  id: string
  name: string
  description: string
  productionUrl: string | null
  preproductionUrl: string | null
  order: number
  active: boolean
  accessStatus: AppRequestStatus | null
}

export interface ApplicationAccessEntry {
  appId: string
  email: string
  createdAt: string
  status: "approved"
}

export interface ApplicationAccessRequestEntry {
  appId: string
  email: string
  requestId: string
  requestedAt: string
}

export interface AccessActionState {
  status: "idle" | "success" | "error"
  message: string
}

export interface ApplicationAdminData {
  app: ApplicationEntry
  grants: ApplicationAccessEntry[]
  requests: ApplicationAccessRequestEntry[]
}
