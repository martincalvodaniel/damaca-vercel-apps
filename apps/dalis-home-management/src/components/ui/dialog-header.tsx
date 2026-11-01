"use client"

interface DialogHeaderProps {
  title: string
  onDismiss: () => void
  cancelLabel?: string
  cancelDisabled?: boolean
  confirmLabel?: string
  confirmDisabled?: boolean
  confirmForm?: string
  onConfirm?: () => void
  pending?: boolean
}

export function DialogHeader({
  title,
  onDismiss,
  cancelLabel = "Cancelar",
  cancelDisabled = false,
  confirmLabel,
  confirmDisabled = false,
  confirmForm,
  onConfirm,
  pending = false,
}: DialogHeaderProps) {
  return (
    <header className="dialog-header grid shrink-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 border-b border-current/10 bg-[#fbfaf6] px-3 py-1 dark:bg-[#182e26]">
      <button
        type="button"
        onClick={onDismiss}
        disabled={cancelDisabled}
        aria-label={cancelLabel}
        title={cancelLabel}
        className="grid size-11 place-items-center rounded-full text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-600 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/30"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-6"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <h2 className="min-w-0 text-center text-sm font-semibold wrap-anywhere">
        {title}
      </h2>
      {confirmLabel ? (
        <button
          type={onConfirm ? "button" : "submit"}
          form={confirmForm}
          onClick={onConfirm}
          disabled={confirmDisabled}
          aria-label={confirmLabel}
          title={confirmLabel}
          className="grid size-11 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-6"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
      {pending ? (
        <span role="status" className="sr-only">
          {confirmLabel}
        </span>
      ) : null}
    </header>
  )
}
