import type {
  Commission,
  CommissionFields,
  CommissionPaymentGeneration,
} from "../entities/commission"
import type { PaymentMethod } from "../entities/payment"

export interface CommissionRepository {
  findAll(): Promise<Commission[]>
  findById(id: string): Promise<Commission | null>
  findByPaymentId(paymentId: string): Promise<Commission | null>
  create(data: Omit<Commission, "_id">): Promise<string>
  update(id: string, fields: Partial<CommissionFields>): Promise<boolean>
  delete(id: string): Promise<boolean>
  reservePayment(
    id: string,
    date: string,
    method: PaymentMethod
  ): Promise<Commission | null>
  completePayment(
    id: string,
    generation: CommissionPaymentGeneration
  ): Promise<boolean>
  unlinkPayment(paymentId: string): Promise<void>
}
