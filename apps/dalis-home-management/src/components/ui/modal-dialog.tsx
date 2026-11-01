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
      className="fullscreen-dialog bg-[#fbfaf6] p-0 text-[#17352b] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:bg-[#182e26] dark:text-[#f4f1e7]"
    >
      {children}
    </dialog>
  )
}
