import Link from "next/link"
import { DigestIcon } from "@/components/ui/digest-icon"
import { clearLibraryFilters } from "@/features/filters/filter-actions"
import { type LibraryQuery, libraryPageHref } from "@/schemas/library"

const labels = {
  author: "Author",
  source: "Source",
  topic: "Topic",
  language: "Language",
  type: "Type",
  access: "Access",
  reading: "Reading",
  favorite: "Favorites",
  capturedFrom: "Captured from",
  capturedTo: "Captured through",
  publishedFrom: "Published from",
  publishedTo: "Published through",
} as const

export function LibraryActiveFilters({ query }: { query: LibraryQuery }) {
  const keys = (Object.keys(labels) as (keyof typeof labels)[]).filter(
    (key) => query[key]
  )
  if (!keys.length && !query.q && query.sort === "capture") return null
  const chips = keys.flatMap((key) => {
    const values = query[key]
    return (Array.isArray(values) ? values : [values]).map((value) => {
      const text = key === "favorite" ? labels[key] : `${labels[key]}: ${value}`
      return (
        <Link
          key={`${key}:${value}`}
          aria-label={`Remove ${text} filter`}
          href={libraryPageHref(
            {
              ...query,
              [key]: Array.isArray(values)
                ? values.filter((item) => item !== value)
                : undefined,
            },
            1
          )}
          className="inline-flex min-h-11 max-w-full items-center text-xs font-medium"
        >
          <span className="break-all rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-teal-950 hover:border-teal-600 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100">
            {text}{" "}
            <span aria-hidden="true" className="ms-1">
              ×
            </span>
          </span>
        </Link>
      )
    })
  })
  return (
    <section
      className="flex min-w-0 items-start gap-x-2"
      aria-label="Active filters"
    >
      {chips.length ? (
        <>
          <details className="min-w-0 sm:hidden">
            <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
              {chips.length}{" "}
              {chips.length === 1 ? "active filter" : "active filters"}
            </summary>
            <div className="flex flex-wrap items-center gap-x-2">{chips}</div>
          </details>
          <div className="hidden min-w-0 flex-wrap items-center gap-x-2 sm:flex">
            {chips}
          </div>
        </>
      ) : null}
      <form action={clearLibraryFilters}>
        <button
          type="submit"
          aria-label="Clear all filters"
          title="Clear all filters"
          className="digest-icon-button text-red-700 dark:text-red-300"
        >
          <DigestIcon name="close" />
        </button>
      </form>
    </section>
  )
}
