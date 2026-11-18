"use client"

import Link from "next/link"
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { DigestIcon } from "@/components/ui/digest-icon"

export function SearchDialog({
  label,
  icon,
  applyLabel,
  clearHref,
  openOnError,
  children,
}: {
  label: string
  icon: "filters" | "topics"
  applyLabel: string
  clearHref?: string
  openOnError?: boolean
  children: ReactNode
}) {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const [revision, setRevision] = useState(0)
  const show = useCallback(() => {
    dialog.current?.showModal()
    close.current?.focus()
  }, [])
  useEffect(() => {
    if (openOnError) show()
  }, [openOnError, show])
  const dismiss = useCallback(() => dialog.current?.close(), [])
  const restore = useCallback(() => {
    if (icon === "filters") setRevision((value) => value + 1)
    trigger.current?.focus()
  }, [icon])
  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        onClick={show}
        className="digest-icon-button"
      >
        <span className="digest-panel grid size-8 place-items-center rounded-lg">
          <DigestIcon name={icon} />
        </span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={id}
        onClose={restore}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto bg-background text-foreground"
      >
        <header className="sticky top-0 z-10 border-b border-(--panel-line) bg-(--surface)">
          <div className="mx-auto flex max-w-3xl items-center gap-1 px-3">
            <h2
              id={id}
              className="mr-auto min-w-0 break-words text-sm font-semibold"
            >
              {label}
            </h2>
            {clearHref ? (
              <Link
                href={clearHref}
                onClick={dismiss}
                aria-label="Clear filters"
                title="Clear filters"
                className="digest-icon-button"
              >
                <DigestIcon name="delete" />
              </Link>
            ) : null}
            <button
              type="submit"
              aria-label={applyLabel}
              title={applyLabel}
              className="digest-icon-button text-teal-800 dark:text-teal-300"
            >
              <DigestIcon name="confirm" />
            </button>
            <button
              ref={close}
              type="button"
              aria-label="Close"
              title="Close"
              onClick={dismiss}
              className="digest-icon-button text-red-700 dark:text-red-300"
            >
              <DigestIcon name="close" />
            </button>
          </div>
        </header>
        <div key={revision} className="mx-auto max-w-3xl px-3 py-2">
          {children}
        </div>
      </dialog>
    </>
  )
}
