"use client"
import PaymentActions from "@/components/shared/PaymentActions"
import { useGenerateCommissionPayment } from "@/features/commissions/hooks/useCommissionMutations"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import type { Commission } from "@/lib/domain/entities/commission"
import type { PaymentMethod } from "@/lib/domain/entities/payment"

export default function CommissionPaymentActions({
  commission,
  onOpen,
  onError,
  onSuccess,
  isOpeningPayment,
}: {
  commission: Commission
  onOpen: (id: string) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
  isOpeningPayment?: boolean
}) {
  const generate = useGenerateCommissionPayment()
  const handleGenerate = async (method: PaymentMethod) => {
    if (!commission._id || generate.isMutating) return
    try {
      const result = await generate.trigger({
        id: commission._id,
        paymentMethod: method,
      })
      onSuccess(result.alreadyExists ? "El pago ya existe" : "Pago generado")
      if (result.paymentId) onOpen(result.paymentId)
    } catch (error) {
      onError(
        extractErrorMessage(
          error,
          "No se pudo generar el pago. Reintenta para completar la generación pendiente."
        )
      )
    }
  }
  function generatePayment(method: PaymentMethod) {
    void handleGenerate(method)
  }
  return (
    <PaymentActions
      name={commission.title}
      paymentId={commission.paymentId}
      isGenerating={generate.isMutating}
      isOpeningPayment={isOpeningPayment}
      generationDisabled={commission.concepts.length === 0}
      reservedMethod={commission.paymentGeneration?.paymentMethod}
      onGenerate={generatePayment}
      onOpen={onOpen}
    />
  )
}
