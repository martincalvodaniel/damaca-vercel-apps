"use client"

import {
  type SubmitEvent,
  startTransition,
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
} from "react"
import { DigestIcon } from "@/components/ui/digest-icon"
import { saveArticleEdits } from "@/features/articles/actions"
import { type ArticleEdit, contentType, readingStatus } from "@/schemas/article"

const inputClass =
  "block min-h-9 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"

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
  const [favorite, setFavorite] = useState(values.favorite)
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelDelete = useRef<HTMLButtonElement>(null)
  const dialogTitle = useId()
  const toggleFavorite = useCallback(() => setFavorite((value) => !value), [])
  const openDelete = useCallback(() => {
    dialog.current?.showModal()
    cancelDelete.current?.focus()
  }, [])
  const closeDelete = useCallback(() => dialog.current?.close(), [])
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
        className="digest-panel space-y-2 rounded-xl px-3 pb-3 text-sm sm:px-4"
      >
        <fieldset
          aria-label="Edit article actions"
          className="digest-editor-toolbar sticky top-0 z-20 -mx-3 flex justify-end gap-1 rounded-t-xl border-b border-(--panel-line) bg-(--surface) px-3 sm:-mx-4 sm:px-4 md:top-(--digest-desktop-nav)"
        >
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
            <DigestIcon name="read" />
          </button>
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
          <label>
            Reading status
            <select
              name="readingStatus"
              defaultValue={values.readingStatus}
              className={inputClass}
            >
              {readingStatus.options.map((value) => (
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
              className={`${inputClass} py-2`}
            />
          </label>
        ))}
      </form>
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
            ref={cancelDelete}
            type="button"
            onClick={closeDelete}
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
    </>
  )
}
