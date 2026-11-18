import Link from "next/link"
import { DigestIcon } from "@/components/ui/digest-icon"
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
  if (!keys.length && !query.q) return null
  return (
    <section
      className="flex flex-wrap items-center gap-x-2"
      aria-label="Active filters"
    >
      {keys.map((key) => {
        const text =
          key === "favorite" ? labels[key] : `${labels[key]}: ${query[key]}`
        return (
          <Link
            key={key}
            aria-label={`Remove ${text} filter`}
            href={libraryPageHref({ ...query, [key]: undefined }, 1)}
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
      })}
      <Link
        href="/"
        aria-label="Clear all filters"
        title="Clear all filters"
        className="digest-icon-button text-red-700 dark:text-red-300"
      >
        <DigestIcon name="close" />
      </Link>
    </section>
  )
}
