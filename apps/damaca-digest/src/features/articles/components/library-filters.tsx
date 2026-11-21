import { MultiFilterSelect } from "@/components/ui/multi-filter-select"
import { SearchButton } from "@/components/ui/search-button"
import { SearchDialog } from "@/components/ui/search-dialog"
import { accessStatus, contentType, readingStatus } from "@/schemas/article"
import type { LibraryQuery } from "@/schemas/library"

export function LibraryFilters({
  query,
  languages,
}: {
  query: LibraryQuery
  languages: string[]
}) {
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
  ] as const
  const selectFields = [
    ["access", "Source access", accessStatus.options],
    ["type", "Content type", contentType.options],
    ["reading", "Reading status", readingStatus.options],
    [
      "language",
      "Language",
      [...new Set([...languages, ...(query.language ?? [])])],
    ],
  ] as const

  return (
    <form action="/" className="digest-panel digest-search-panel">
      <input type="hidden" name="reset" value="1" />
      <div className="digest-search-row">
        <label className="min-w-0 flex-1 text-sm">
          <input
            type="search"
            aria-label="Search articles"
            name="q"
            defaultValue={query.q}
            placeholder="Title, author, or keyword"
            maxLength={200}
            className="digest-search-field"
          />
        </label>
        <SearchDialog
          label="Filters and sort"
          icon="filters"
          applyLabel="Apply filters"
          clearHref={
            query.q ? `/?${new URLSearchParams({ q: query.q })}` : "/?reset=1"
          }
        >
          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 pb-2 text-sm">
            {textFields.map(([key, label, max]) => (
              <label key={key}>
                {label}
                <input
                  name={key}
                  defaultValue={query[key]}
                  maxLength={max}
                  className="digest-search-field"
                />
              </label>
            ))}
            {selectFields.map(([key, label, options]) => (
              <MultiFilterSelect
                key={key}
                name={key}
                label={label}
                options={options}
                selected={query[key]}
              />
            ))}
            <label>
              Sort
              <select
                name="sort"
                defaultValue={query.sort}
                className="digest-search-field"
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
                  className="digest-search-field"
                />
              </label>
            ))}
            <label className="col-span-full inline-flex min-h-11 items-center gap-1.5">
              <input
                type="checkbox"
                name="favorite"
                value="true"
                defaultChecked={!!query.favorite}
              />
              Favorites only
            </label>
          </div>
        </SearchDialog>
        <SearchButton label="Search articles" />
      </div>
    </form>
  )
}
