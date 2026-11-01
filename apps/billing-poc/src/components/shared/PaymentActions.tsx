"use client"
import {
  getBadgeSizeClass,
  getBadgeToneClass,
} from "@/components/ui/badge-utils"
import { IconButton } from "@/components/ui/IconButton"
import { BankTransferIcon } from "@/components/ui/icons/BankTransferIcon"
import { CardIcon } from "@/components/ui/icons/CardIcon"
import { CashIcon } from "@/components/ui/icons/CashIcon"
import type { PaymentMethod } from "@/lib/domain/entities/payment"

interface PaymentActionsProps {
  name: string
  paymentId?: string
  hasPayment?: boolean
  isGenerating?: boolean
  isOpeningPayment?: boolean
  generationDisabled?: boolean
  hideOpenPayment?: boolean
  reservedMethod?: PaymentMethod
  onGenerate: (method: PaymentMethod) => void
  onOpen: (paymentId: string) => void
}

export default function PaymentActions({
  name,
  paymentId,
  hasPayment = Boolean(paymentId),
  isGenerating = false,
  isOpeningPayment = false,
  generationDisabled = false,
  hideOpenPayment = false,
  reservedMethod,
  onGenerate,
  onOpen,
}: PaymentActionsProps) {
  function openPayment() {
    if (paymentId) onOpen(paymentId)
  }
  function generateCash() {
    onGenerate("cash")
  }
  function generateCard() {
    onGenerate("card")
  }
  function generateBankTransfer() {
    onGenerate("bank_transfer")
  }
  function isDisabled(method: PaymentMethod) {
    return (
      hasPayment ||
      generationDisabled ||
      Boolean(reservedMethod && reservedMethod !== method)
    )
  }
  function label(method: string) {
    return hasPayment
      ? `Payment already generated for ${name}`
      : `${reservedMethod ? "Retry" : "Generate"} ${method} payment for ${name}`
  }
  return (
    <div className="inline-flex items-center gap-1">
      {hasPayment && !hideOpenPayment && paymentId ? (
        <button
          type="button"
          onClick={openPayment}
          disabled={isOpeningPayment}
          aria-label={`Open payment for ${name}`}
          title="Open payment"
          className={`inline-flex items-center rounded-full font-medium transition-colors hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-green-900/50 ${getBadgeSizeClass("sm")} ${getBadgeToneClass("success")}`}
        >
          {isOpeningPayment ? "€ …" : "€ ✓"}
        </button>
      ) : null}
      <IconButton
        variant="success"
        isPending={isGenerating}
        disabled={isDisabled("cash")}
        onClick={generateCash}
        ariaLabel={label("cash")}
        title="Generate cash payment"
      >
        <CashIcon />
      </IconButton>
      <IconButton
        variant="info"
        isPending={isGenerating}
        disabled={isDisabled("card")}
        onClick={generateCard}
        ariaLabel={label("card")}
        title="Generate card payment"
      >
        <CardIcon />
      </IconButton>
      <IconButton
        variant="neutral"
        isPending={isGenerating}
        disabled={isDisabled("bank_transfer")}
        onClick={generateBankTransfer}
        ariaLabel={label("bank transfer")}
        title="Generate bank transfer payment"
      >
        <BankTransferIcon />
      </IconButton>
    </div>
  )
}
