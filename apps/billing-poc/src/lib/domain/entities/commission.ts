import type { PaymentConcept, PaymentMethod } from "./payment"

export type CommissionPaymentStatus = 0 | 50 | 100

export interface CommissionPaymentGeneration {
  paymentId: string
  date: string
  paymentMethod: PaymentMethod
}

export interface Commission {
  _id?: string
  title: string
  description?: string
  clientId?: string
  dueDate?: string
  paymentStatus: CommissionPaymentStatus
  concepts: PaymentConcept[]
  vat: number
  paymentId?: string
  // A durable reservation allows safe retries after creation or linking fails.
  paymentGeneration?: CommissionPaymentGeneration
  createdAt: Date
  updatedAt: Date
}

export type CommissionFields = Pick<
  Commission,
  | "title"
  | "description"
  | "clientId"
  | "dueDate"
  | "paymentStatus"
  | "concepts"
  | "vat"
>

export function sortCommissions(
  commissions: readonly Commission[]
): Commission[] {
  return [...commissions].sort(
    (a, b) =>
      (a.dueDate ?? "9999-99-99").localeCompare(b.dueDate ?? "9999-99-99") ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
      (a._id ?? "").localeCompare(b._id ?? "")
  )
}
