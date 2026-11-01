"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { Modal } from "@/components/ui/Modal"
import type { PaymentFormData } from "@/lib/domain/entities/payment"
import PaymentForm from "./month/PaymentForm"

interface PaymentFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  initialDate?: string
  initialData?: PaymentFormData
  initialClientQuery?: string
  autoFocusClient?: boolean
  onPaymentSaved?: (date: string) => void
  saveLabel?: string
  pendingLabel?: string
}

export default function PaymentFormModal({
  isOpen,
  onClose,
  title,
  initialDate,
  initialData,
  initialClientQuery,
  autoFocusClient = false,
  onPaymentSaved,
  saveLabel = "Guardar pago",
  pendingLabel = "Guardando...",
}: PaymentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<{
    setFormDate: (dateString: string) => void
    submit: () => void
  }>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePaymentSaved = useCallback(
    (date: string) => {
      onPaymentSaved?.(date)
      onClose()
    },
    [onClose, onPaymentSaved]
  )

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    onClose()
    setIsSubmitting(false)
  }, [onClose])

  const handleSave = useCallback(() => {
    setIsSubmitting(true)
    formRef.current?.submit()
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsSubmitting(false)
      timeoutRef.current = null
    }, 100)
  }, [])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="xl"
      headerActions={
        <ConfirmAction
          onClick={handleSave}
          isPending={isSubmitting}
          label={saveLabel}
          pendingLabel={pendingLabel}
        />
      }
    >
      <PaymentForm
        ref={formRef}
        onPaymentSaved={handlePaymentSaved}
        initialDate={initialDate}
        initialData={initialData}
        initialClientQuery={initialClientQuery}
        autoFocusClient={autoFocusClient}
      />
    </Modal>
  )
}
