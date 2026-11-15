"use client"

import {
  type SubmitEvent,
  startTransition,
  useActionState,
  useCallback,
} from "react"
import { saveArticleEdits } from "@/features/articles/actions"
import { type ArticleEdit, contentType, readingStatus } from "@/schemas/article"

const inputClass =
  "block min-h-11 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"

export function ArticleEditor({
  id,
  revision,
  values,
}: {
  id: string
  revision: number
  values: ArticleEdit
}) {
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
    <form
      action={save}
      onSubmit={submitEdits}
      className="digest-panel space-y-3 rounded-xl p-4 text-sm sm:p-6"
    >
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
      <label className="flex min-h-11 items-center gap-2">
        <input
          type="checkbox"
          name="favorite"
          value="true"
          defaultChecked={values.favorite}
        />{" "}
        Favorite
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="min-h-11 rounded-lg bg-teal-800 px-4 hover:bg-teal-900 font-medium text-white"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  )
}
