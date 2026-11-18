"use client"

import { type RefObject, useCallback, useId } from "react"
import { DigestIcon } from "@/components/ui/digest-icon"

export function ArticleDeleteDialog({
  dialog,
  deleteAction,
}: {
  dialog: RefObject<HTMLDialogElement | null>
  deleteAction: (form: FormData) => Promise<void>
}) {
  const dialogTitle = useId()
  const closeDialog = useCallback(() => dialog.current?.close(), [dialog])
  return (
    <dialog
      ref={dialog}
      aria-labelledby={dialogTitle}
      className="digest-panel m-auto w-[calc(100%-1.5rem)] max-w-sm rounded-xl p-4 text-foreground backdrop:bg-black/60"
    >
      <form
        action={deleteAction}
        className="flex items-center justify-between gap-2"
      >
        <h2 id={dialogTitle} className="font-semibold">
          Delete article?
        </h2>
        <div className="flex items-center">
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Cancel deletion"
            title="Cancel deletion"
            className="digest-icon-button text-red-700 dark:text-red-300 order-2"
          >
            <DigestIcon name="close" />
          </button>
          <button
            type="submit"
            name="confirm"
            value="true"
            aria-label="Confirm deletion"
            title="Confirm deletion"
            className="digest-icon-button text-teal-800 dark:text-teal-300 order-1"
          >
            <DigestIcon name="confirm" />
          </button>
        </div>
      </form>
      <p className="mt-1 text-sm">
        This permanently deletes the article and its notes.
      </p>
    </dialog>
  )
}
