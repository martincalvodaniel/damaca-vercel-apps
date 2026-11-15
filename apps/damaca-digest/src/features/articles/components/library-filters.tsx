import Link from "next/link"
import { accessStatus, contentType, readingStatus } from "@/schemas/article"
import type { LibraryQuery } from "@/schemas/library"

const inputClass =
  "block min-h-10 w-full min-w-0 rounded-lg border border-zinc-300 bg-transparent px-2 dark:border-zinc-700"

export function LibraryFilters({ query }: { query: LibraryQuery }) {
  const dateFields = [
    ["capturedFrom", "Captured from"],
    ["capturedTo", "Captured through"],
    ["publishedFrom", "Published from"],
    ["publishedTo", "Published through"],
  ] as const
  const textFields = [
    ["author", "Author", 150],
    ["source", "Source or domain", 180],
    ["topic", "Topic", 100],
    ["language", "Language", 35],
  ] as const
  const selectFields = [
    ["access", "Source access", accessStatus.options],
    ["type", "Content type", contentType.options],
    ["reading", "Reading status", readingStatus.options],
  ] as const

  return (
    <form action="/" className="space-y-2">
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1 text-sm">
          Search articles
          <input
            type="search"
            name="q"
            defaultValue={query.q}
            maxLength={200}
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-emerald-800 px-3 font-medium text-white"
        >
          Search
        </button>
      </div>
      <details className="rounded-lg border border-zinc-300 px-3 dark:border-zinc-700">
        <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">
          Filters and sort
        </summary>
        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 pb-3 text-sm">
          {textFields.map(([key, label, max]) => (
            <label key={key}>
              {label}
              <input
                name={key}
                defaultValue={query[key]}
                maxLength={max}
                className={inputClass}
              />
            </label>
          ))}
          {selectFields.map(([key, label, options]) => (
            <label key={key}>
              {label}
              <select
                name={key}
                defaultValue={query[key] ?? ""}
                className={inputClass}
              >
                <option value="">Any</option>
                {options.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label>
            Sort
            <select
              name="sort"
              defaultValue={query.sort}
              className={inputClass}
            >
              <option value="capture">Newest capture</option>
              <option value="publication">Newest publication</option>
              <option value="title">Title</option>
              <option value="relevance">Search relevance</option>
            </select>
          </label>
          {dateFields.map(([key, label]) => (
            <label key={key} className="min-w-0">
              {label}
              <input
                type="date"
                name={key}
                defaultValue={query[key]}
                className={inputClass}
              />
            </label>
          ))}
          <label className="col-span-full inline-flex min-h-11 items-center gap-2">
            <input
              type="checkbox"
              name="favorite"
              value="true"
              defaultChecked={!!query.favorite}
            />
            Favorites only
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-emerald-800 px-3 font-medium text-white"
          >
            Apply filters
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center underline"
          >
            Clear
          </Link>
        </div>
      </details>
    </form>
  )
}
