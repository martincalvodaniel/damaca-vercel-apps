"use client"

import type * as React from "react"
import { useCallback, useEffect } from "react"

import { DialogHeader } from "@/components/ui/dialog-header"
import { useDialogViewport } from "@/hooks/use-dialog-viewport"

interface ConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onDismiss: () => void
  cancelLabel?: string
  secondaryLabel?: string
  onSecondary?: () => void
  tone?: "default" | "danger"
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onDismiss,
  cancelLabel = "Cancelar",
  secondaryLabel,
  onSecondary,
  tone = "default",
}: ConfirmationDialogProps) {
  const dialogRef = useDialogViewport(open)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (!open) {
      if (dialog.open) {
        dialog.close()
      }
      return
    }

    if (!dialog.open) {
      dialog.showModal()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, dialogRef])

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onDismiss()
    },
    [onDismiss]
  )

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      aria-label={title}
      className="fullscreen-dialog bg-[#fbfaf6] p-0 text-[#17352b] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:bg-[#182e26] dark:text-[#f4f1e7]"
    >
      <section className="flex h-full min-h-0 flex-col">
        <DialogHeader
          title={title}
          onDismiss={onDismiss}
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onConfirm={onConfirm}
        />
        <div className="dialog-content space-y-4 p-4 sm:p-6">
          <p
            className={`text-sm leading-6 ${tone === "danger" ? "text-[#a34435] dark:text-[#ffb4a4]" : "text-[#63736a] dark:text-[#b4c0b8]"}`}
          >
            {description}
          </p>
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="min-h-11 rounded-full border border-[#9bb0a1] px-4 text-sm font-semibold text-[#315847] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] dark:border-[#587166] dark:text-[#d4e1d8]"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </section>
    </dialog>
  )
}
