"use client"

import Link from "next/link"
import {
  type SubmitEvent,
  startTransition,
  useActionState,
  useCallback,
  useRef,
  useState,
} from "react"
import { DigestIcon } from "@/components/ui/digest-icon"
import { saveArticleEdits } from "@/features/articles/actions"
import {
  type ArticleEdit,
  contentType,
  nextReadingStatus,
} from "@/schemas/article"
import { ArticleDeleteDialog } from "./article-delete-dialog"

const inputClass =
  "block min-h-8 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"

export function ArticleEditor({
  id,
  revision,
  values,
  deleteAction,
  deletion,
}: {
  id: string
  revision: number
  values: ArticleEdit
  deleteAction: (form: FormData) => Promise<void>
  deletion?: string
}) {
  const [status, setStatus] = useState(values.readingStatus)
  const [favorite, setFavorite] = useState(values.favorite)
  const dialog = useRef<HTMLDialogElement>(null)
  const changeStatus = useCallback(() => setStatus(nextReadingStatus), [])
  const toggleFavorite = useCallback(() => setFavorite((value) => !value), [])
  const openDelete = useCallback(() => {
    dialog.current?.showModal()
  }, [])
  const [error, save, saving] = useActionState(
    saveArticleEdits.bind(null, id, revision),
    null
  )
  const submitEdits = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const form = new FormData(event.currentTarget)
      startTransition(() => save(form))
    },
    [save]
  )
  const fields = [
    ["title", "Title", "text", 350],
    ["source", "Source", "text", 180],
    ["publishedAt", "Publication date", "date", 10],
    ["language", "Language code", "text", 35],
  ] as const
  const longFields = [
    ["authors", "Authors, one per line", values.authors.join("\n"), 4000, 2],
    ["summary", "Summary", values.summary, 12000, 4],
    [
      "keyTakeaways",
      "Key takeaways, one per line",
      values.keyTakeaways.join("\n"),
      31000,
      3,
    ],
    [
      "topics",
      "Topics, one per line",
      values.topics?.join("\n") ?? "",
      1514,
      3,
    ],
    ["personalNotes", "Personal notes", values.personalNotes, 12000, 4],
  ] as const

  return (
    <>
      <form
        action={save}
        onSubmit={submitEdits}
        className="digest-panel space-y-1.5 rounded-xl px-2 pb-2 text-sm sm:px-3"
      >
        <fieldset
          aria-label="Edit article actions"
          className="digest-editor-toolbar sticky top-0 z-20 -mx-2 flex justify-end gap-1 rounded-t-xl border-b border-(--panel-line) bg-(--surface) px-2 sm:-mx-3 sm:px-3 md:top-(--digest-desktop-nav)"
        >
          <button
            type="button"
            className="digest-icon-button"
            aria-label={`Reading status: ${status}. Change to ${nextReadingStatus(status)}`}
            title={`Reading status: ${status}`}
            disabled={saving}
            onClick={changeStatus}
          >
            <DigestIcon name={status} />
          </button>
          <button
            type="button"
            className="digest-icon-button"
            aria-label="Favorite"
            aria-pressed={favorite}
            title="Favorite"
            disabled={saving}
            onClick={toggleFavorite}
          >
            <DigestIcon name="favorite" filled={favorite} />
          </button>
          <button
            type="submit"
            className="digest-icon-button text-teal-800 disabled:opacity-50 dark:text-teal-300"
            aria-label={saving ? "Saving changes" : "Save changes"}
            title="Save changes"
            disabled={saving}
          >
            <DigestIcon name="confirm" />
          </button>
          <Link
            href={`/articles/${id}`}
            className="digest-icon-button text-red-700 dark:text-red-300"
            aria-label="Close without saving"
            title="Close without saving"
          >
            <DigestIcon name="close" />
          </Link>
          <button
            type="button"
            className="digest-icon-button text-red-700 dark:text-red-300"
            aria-label="Delete article"
            title="Delete article"
            disabled={saving}
            onClick={openDelete}
          >
            <DigestIcon name="delete" />
          </button>
        </fieldset>
        <input type="hidden" name="readingStatus" value={status} />
        <input
          type="hidden"
          name="favorite"
          value={favorite ? "true" : "false"}
        />
        {saving ? (
          <p role="status" className="sr-only">
            Saving changes…
          </p>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        {deletion === "failed" ? (
          <p role="alert">
            The article could not be deleted. Reload and try again.
          </p>
        ) : null}
        {deletion === "confirm" ? (
          <p role="alert">Confirm that you want to delete this article.</p>
        ) : null}
        <div className="grid gap-2 min-[420px]:grid-cols-2">
          {fields.map(([key, label, type, max]) => (
            <label key={key} className="min-w-0">
              {label}
              <input
                name={key}
                type={type}
                maxLength={max}
                defaultValue={values[key]}
                className={inputClass}
              />
            </label>
          ))}
          <label>
            Content type
            <select
              name="contentType"
              defaultValue={values.contentType}
              className={inputClass}
            >
              <option value="">Unspecified</option>
              {contentType.options.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        {longFields.map(([key, label, value, max, rows]) => (
          <label key={key} className="block">
            {label}
            <textarea
              name={key}
              rows={rows}
              maxLength={max}
              defaultValue={value}
              className={`${inputClass} py-1`}
            />
          </label>
        ))}
      </form>
      <ArticleDeleteDialog dialog={dialog} deleteAction={deleteAction} />
    </>
  )
}
