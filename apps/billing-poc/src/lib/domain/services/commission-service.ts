import type { Commission, CommissionFields } from "../entities/commission"
import { getPaymentInvoices, type PaymentMethod } from "../entities/payment"
import type { CommissionRepository } from "../ports/commission-repository"
import type { PaymentRepository } from "../ports/payment-repository"
import { todayLocalISO } from "./event-payment-helpers"
import { computePaymentFinancials } from "./payment-calculator"

export class CommissionError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message)
  }
}

interface Dependencies {
  commissions: CommissionRepository
  payments: PaymentRepository
  paymentTag?: "Encargo" | "Cocción"
}

async function requireCommission(
  id: string,
  deps: Dependencies
): Promise<Commission> {
  const commission = await deps.commissions.findById(id)
  if (!commission) throw new CommissionError("Commission not found", 404)
  return commission
}

export async function generateCommissionPayment(
  id: string,
  method: PaymentMethod,
  deps: Dependencies
) {
  let commission = await requireCommission(id, deps)
  if (commission.paymentId)
    return { paymentId: commission.paymentId, alreadyExists: true }
  if (!commission.concepts.length)
    throw new CommissionError(
      "At least one concept is required to generate payment",
      400
    )

  // Reserve before creating: every concurrent request and retry uses the same ID.
  commission =
    (await deps.commissions.reservePayment(id, todayLocalISO(), method)) ??
    (await requireCommission(id, deps))
  if (commission.paymentId)
    return { paymentId: commission.paymentId, alreadyExists: true }
  const generation = commission.paymentGeneration
  if (!generation)
    throw new CommissionError("Commission changed; please retry", 409)
  const existing = await deps.payments.findById(generation.paymentId)
  if (!existing) {
    const now = new Date()
    try {
      await deps.payments.create(
        {
          type: "income",
          date: generation.date,
          tag: deps.paymentTag ?? "Encargo",
          clientId: commission.clientId,
          concepts: commission.concepts,
          vat: commission.vat,
          paymentMethod: generation.paymentMethod,
          ...computePaymentFinancials(commission.concepts, commission.vat),
          createdAt: now,
          updatedAt: now,
        },
        generation.paymentId
      )
    } catch (error) {
      // A competing request may have inserted this exact payment first.
      if (!(await deps.payments.findById(generation.paymentId))) throw error
    }
  }
  if (!(await deps.commissions.completePayment(id, generation))) {
    throw new CommissionError(
      "Payment created; retry to finish linking it",
      409
    )
  }
  return { paymentId: generation.paymentId, alreadyExists: Boolean(existing) }
}

export async function updateCommission(
  id: string,
  fields: Partial<CommissionFields>,
  deps: Dependencies
) {
  const existing = await requireCommission(id, deps)
  if (existing.paymentGeneration)
    throw new CommissionError(
      "Finish generating the pending payment before editing",
      409
    )
  const merged = { ...existing, ...fields }
  if (existing.paymentId && !merged.concepts.length)
    throw new CommissionError(
      "A commission with a linked payment needs at least one concept",
      400
    )
  const syncNeeded = ["clientId", "concepts", "vat"].some(
    (key) => key in fields
  )
  const payment =
    existing.paymentId && syncNeeded
      ? await deps.payments.findById(existing.paymentId)
      : null
  const invoiced =
    payment &&
    getPaymentInvoices(payment).some((invoice) => Boolean(invoice.id))
  if (!(await deps.commissions.update(id, fields)))
    throw new CommissionError("Commission changed; please retry", 409)
  if (!payment || !syncNeeded)
    return { success: true, paymentSync: "unchanged" as const }
  if (invoiced) return { success: true, paymentSync: "invoiced" as const }
  const financials = computePaymentFinancials(
    merged.concepts,
    merged.vat,
    payment.surcharge ?? 0,
    payment.discount ?? 0
  )
  const updated = await deps.payments.update(existing.paymentId as string, {
    concepts: merged.concepts,
    clientId: merged.clientId ?? "",
    vat: merged.vat,
    ...financials,
    updatedAt: new Date(),
  })
  if (!updated)
    throw new CommissionError(
      "Commission saved, but its payment could not be synchronized; retry saving",
      409
    )
  return { success: true, paymentSync: "updated" as const }
}

export async function deleteCommission(id: string, deps: Dependencies) {
  const commission = await requireCommission(id, deps)
  if (commission.paymentGeneration)
    throw new CommissionError(
      "Finish generating the pending payment before deleting",
      409
    )
  if (!(await deps.commissions.delete(id)))
    throw new CommissionError("Commission changed; please retry", 409)
  return { success: true }
}
