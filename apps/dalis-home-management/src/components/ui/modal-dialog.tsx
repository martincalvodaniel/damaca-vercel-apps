"use client"

import type * as React from "react"
import type { ReactNode } from "react"
import { useCallback, useEffect } from "react"

import { useDialogViewport } from "@/hooks/use-dialog-viewport"

interface ModalDialogProps {
  open: boolean
  ariaLabel: string
  children: ReactNode
  onDismiss: () => void
}

export function ModalDialog({
  open,
  ariaLabel,
  children,
  onDismiss,
}: ModalDialogProps) {
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
      aria-label={ariaLabel}
      onCancel={handleCancel}
      className="fullscreen-dialog bg-surface p-0 text-ink backdrop:bg-overlay/65 backdrop:backdrop-blur-sm"
    >
      {children}
    </dialog>
  )
}
