"use client"
import { useState } from "react"
import { useGenerateCommissionPayment } from "@/features/commissions/hooks/useCommissionMutations"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import type { Commission } from "@/lib/domain/entities/commission"
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/domain/entities/payment"

import { commissionButtonClass } from "./commission-ui"

export default function CommissionPaymentActions({
  commission,
  onOpen,
  onError,
  onSuccess,
}: {
  commission: Commission
  onOpen: (id: string) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
}) {
  const generate = useGenerateCommissionPayment()
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const handleGenerate = async () => {
    if (!commission._id || generate.isMutating) return
    try {
      const result = await generate.trigger({
        id: commission._id,
        paymentMethod: method,
      })
      onSuccess(
        result.alreadyExists ? "Payment already exists" : "Payment generated"
      )
      if (result.paymentId) onOpen(result.paymentId)
    } catch (error) {
      onError(
        extractErrorMessage(
          error,
          "Failed to generate payment. Retry to finish the pending generation."
        )
      )
    }
  }
  function openPayment() {
    if (commission.paymentId) onOpen(commission.paymentId)
  }
  function changeMethod(event: React.ChangeEvent<HTMLSelectElement>) {
    setMethod(event.target.value as PaymentMethod)
  }
  function generatePayment() {
    void handleGenerate()
  }
  if (commission.paymentId)
    return (
      <button
        type="button"
        className={commissionButtonClass}
        onClick={openPayment}
      >
        Open payment
      </button>
    )
  return (
    <div className="flex flex-wrap gap-2">
      <select
        className={commissionButtonClass}
        aria-label={`Payment method for ${commission.title}`}
        value={commission.paymentGeneration?.paymentMethod ?? method}
        disabled={generate.isMutating || Boolean(commission.paymentGeneration)}
        onChange={changeMethod}
      >
        {PAYMENT_METHODS.map((method) => (
          <option key={method} value={method}>
            {PAYMENT_METHOD_LABELS[method]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={commissionButtonClass}
        disabled={generate.isMutating || commission.concepts.length === 0}
        onClick={generatePayment}
        title={
          commission.concepts.length === 0
            ? "Add at least one concept to generate payment"
            : undefined
        }
      >
        {generate.isMutating
          ? "Generating…"
          : commission.paymentGeneration
            ? "Retry payment"
            : "Generate payment"}
      </button>
    </div>
  )
}
