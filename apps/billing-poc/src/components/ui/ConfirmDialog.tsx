"use client"
import type { ReactNode } from "react"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { useStableCallback } from "@/hooks/useStableCallback"
import { ErrorBanner } from "./ErrorBanner"
import { Modal } from "./Modal"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  confirmLabel?: string
  pendingLabel?: string
  cancelLabel?: string
  variant?: "danger" | "primary"
  isPending: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: () => void
  children: ReactNode
}
export function ConfirmDialog({
  isOpen,
  title,
  confirmLabel = "Confirmar",
  pendingLabel = "Procesando…",
  isPending,
  error,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const handleClose = useStableCallback(() => {
    if (!isPending) onCancel()
  })
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="sm"
      headerActions={
        <ConfirmAction
          onClick={onConfirm}
          isPending={isPending}
          label={confirmLabel}
          pendingLabel={pendingLabel}
        />
      }
    >
      <div className="space-y-3">
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        {children}
      </div>
    </Modal>
  )
}
