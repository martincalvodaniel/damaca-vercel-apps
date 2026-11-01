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
    <header className="dialog-header grid shrink-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 border-b border-current/10 bg-surface px-3 py-1">
      <button
        type="button"
        onClick={onDismiss}
        disabled={cancelDisabled}
        aria-label={cancelLabel}
        title={cancelLabel}
        className="grid size-11 place-items-center rounded-full text-danger transition hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
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
          className="grid size-11 place-items-center rounded-full text-success transition hover:bg-success-soft focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
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
