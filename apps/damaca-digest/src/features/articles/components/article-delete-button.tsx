"use client"

import { useCallback, useRef } from "react"
import { DigestIcon } from "@/components/ui/digest-icon"
import { ArticleDeleteDialog } from "./article-delete-dialog"

export function ArticleDeleteButton({
  deleteAction,
}: {
  deleteAction: (form: FormData) => Promise<void>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const openDialog = useCallback(() => dialog.current?.showModal(), [])
  return (
    <>
      <button
        type="button"
        className="digest-icon-button text-red-700 dark:text-red-300"
        aria-label="Delete article"
        title="Delete article"
        onClick={openDialog}
      >
        <DigestIcon name="delete" />
      </button>
      <ArticleDeleteDialog dialog={dialog} deleteAction={deleteAction} />
    </>
  )
}
