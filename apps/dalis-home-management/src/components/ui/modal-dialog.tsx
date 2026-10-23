"use client"

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"

interface ModalDialogProps {
  open: boolean
  ariaLabel: string
  size?: "md" | "lg" | "xl"
  scrollable?: boolean
  children: ReactNode
  onDismiss: () => void
}

const sizeClasses = {
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-6xl",
} as const

export function ModalDialog({
  open,
  ariaLabel,
  size = "md",
  scrollable = true,
  children,
  onDismiss,
}: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

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
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      onCancel={(event) => {
        event.preventDefault()
        onDismiss()
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] border-0 bg-transparent p-0 text-[#17352b] shadow-[0_28px_90px_rgba(10,35,27,0.35)] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:text-[#f4f1e7] ${scrollable ? "overflow-y-auto overscroll-contain" : "overflow-hidden"} ${sizeClasses[size]}`}
    >
      {children}
    </dialog>
  )
}
