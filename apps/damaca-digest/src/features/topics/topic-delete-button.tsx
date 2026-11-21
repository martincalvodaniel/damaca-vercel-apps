"use client"

import { useCallback, useId, useRef } from "react"
import { DigestIcon } from "@/components/ui/digest-icon"
import { removeEmptyTopic } from "./actions"

export function TopicDeleteButton({
  id,
  label,
  query,
}: {
  id: string
  label: string
  query?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const title = useId()
  const open = useCallback(() => dialog.current?.showModal(), [])
  const close = useCallback(() => dialog.current?.close(), [])
  return (
    <>
      <button
        type="button"
        className="digest-icon-button text-red-700 dark:text-red-300"
        aria-label={`Delete topic: ${label}`}
        title="Delete topic"
        onClick={open}
      >
        <DigestIcon name="delete" />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={title}
        className="digest-panel m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-xl p-4 text-foreground backdrop:bg-black/60"
      >
        <form
          action={removeEmptyTopic}
          className="flex items-center justify-between gap-2"
        >
          <input type="hidden" name="topicId" value={id} />
          {query ? <input type="hidden" name="q" value={query} /> : null}
          <h2 id={title} className="min-w-0 break-words font-semibold">
            Delete {label}?
          </h2>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={close}
              aria-label="Cancel deletion"
              title="Cancel deletion"
              className="digest-icon-button order-2 text-red-700 dark:text-red-300"
            >
              <DigestIcon name="close" />
            </button>
            <button
              type="submit"
              name="confirm"
              value="true"
              aria-label="Confirm deletion"
              title="Confirm deletion"
              className="digest-icon-button order-1 text-teal-800 dark:text-teal-300"
            >
              <DigestIcon name="confirm" />
            </button>
          </div>
        </form>
        <p className="mt-1 text-sm">This removes the topic and its aliases.</p>
      </dialog>
    </>
  )
}
