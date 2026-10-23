"use client"

import { useEffect, useRef } from "react"

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
      onCancel={(event) => {
        event.preventDefault()
        onDismiss()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-[1.75rem] border border-[#d8dfd7] bg-[#fbfaf6] p-0 text-[#17352b] shadow-[0_28px_90px_rgba(10,35,27,0.35)] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:border-white/15 dark:bg-[#182e26] dark:text-[#f4f1e7]"
    >
      <div className="p-6 sm:p-7">
        <header className="sticky -top-6 z-10 -mx-6 -mt-6 border-b border-[#d8dfd7] bg-[#fbfaf6] px-6 pt-6 pb-4 sm:-top-7 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7 dark:border-white/15 dark:bg-[#182e26]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c36d49]">
            Confirmación
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            {title}
          </h2>
        </header>
        <p className="mt-3 text-sm leading-6 text-[#63736a] dark:text-[#b4c0b8]">
          {description}
        </p>

        <footer className="sticky -bottom-6 z-10 -mx-6 -mb-6 mt-7 flex gap-2 border-t border-[#d8dfd7] bg-[#fbfaf6] px-6 py-4 sm:-bottom-7 sm:-mx-7 sm:-mb-7 sm:px-7 dark:border-white/15 dark:bg-[#182e26]">
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-[#ccd5ca] px-2 text-xs leading-tight font-semibold transition hover:bg-[#edf0e9] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] sm:px-4 sm:text-sm dark:border-white/15 dark:hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-[#9bb0a1] px-2 text-xs leading-tight font-semibold text-[#315847] transition hover:bg-[#e7efe5] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] sm:px-4 sm:text-sm dark:border-[#587166] dark:text-[#d4e1d8] dark:hover:bg-white/10"
            >
              {secondaryLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-full px-2 text-xs leading-tight font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 sm:px-4 sm:text-sm dark:ring-offset-[#182e26] ${
              tone === "danger"
                ? "bg-[#a34435] hover:bg-[#89372c] focus:ring-[#a34435]"
                : "bg-[#1d4f40] hover:bg-[#173f34] focus:ring-[#1d4f40]"
            }`}
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </dialog>
  )
}
