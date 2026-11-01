"use client"

import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { Modal } from "@/components/ui/Modal"

interface InvoiceGuardModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceType: string
  invoiceId: string
}

export default function InvoiceGuardModal({
  isOpen,
  onClose,
  invoiceType,
  invoiceId,
}: InvoiceGuardModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="La factura ya se ha generado"
      maxWidth="md"
      headerActions={<ConfirmAction onClick={onClose} label="Entendido" />}
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          This attendee's payment has invoice {invoiceType} {invoiceId}.
          Invoices cannot be modified once generated. To change the seat count,
          first delete the invoice from the payment, then retry.
        </p>
      </div>
    </Modal>
  )
}
