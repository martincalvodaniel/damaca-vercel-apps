"use client"

import { type ReactNode, useContext } from "react"
import { createPortal } from "react-dom"
import { ConfirmAction } from "./ConfirmAction"
import { ModalActionsContext } from "./modal-actions-context"

export function ModalHeaderActions({ children }: { children: ReactNode }) {
  const context = useContext(ModalActionsContext)
  if (!context) return children
  return context.target ? createPortal(children, context.target) : null
}

interface ModalFormActionsProps {
  formId: string
  label: string
  isPending: boolean
  disabled?: boolean
  onCancel?: () => void
}

export function ModalFormActions({
  formId,
  label,
  isPending,
  disabled,
  onCancel,
}: ModalFormActionsProps) {
  const context = useContext(ModalActionsContext)
  if (!context) {
    return (
      <div className="flex justify-end gap-2 pt-4">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          form={formId}
          disabled={disabled || isPending}
          aria-busy={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 dark:bg-blue-700"
        >
          {String(isPending ? "Guardando…" : label)}
        </button>
      </div>
    )
  }
  return (
    <ModalHeaderActions>
      <div className="flex items-center gap-1">
        <ConfirmAction
          type="submit"
          form={formId}
          label={label}
          isPending={isPending}
          disabled={disabled}
        />
      </div>
    </ModalHeaderActions>
  )
}
