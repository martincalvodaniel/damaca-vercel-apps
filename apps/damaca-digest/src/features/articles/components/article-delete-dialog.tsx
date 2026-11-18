"use client"

import { type RefObject, useCallback, useId } from "react"

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
      <h2 id={dialogTitle} className="font-semibold">
        Delete article?
      </h2>
      <p className="mt-1 text-sm">
        This permanently deletes the article and its notes.
      </p>
      <form
        action={deleteAction}
        className="mt-3 flex flex-wrap justify-end gap-2"
      >
        <button
          type="button"
          onClick={closeDialog}
          className="min-h-9 rounded-lg px-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          name="confirm"
          value="true"
          className="min-h-9 rounded-lg bg-red-800 px-3 text-white"
        >
          Delete article
        </button>
      </form>
    </dialog>
  )
}
