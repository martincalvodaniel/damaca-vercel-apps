import Link from "next/link"
import { LibraryActiveFilters } from "@/features/articles/components/library-active-filters"
import { LibraryArticle } from "@/features/articles/components/library-article"
import { LibraryFilters } from "@/features/articles/components/library-filters"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listArticles } from "@/lib/db/articles"
import {
  libraryPageHref,
  libraryQuery,
  parseLibraryQuery,
} from "@/schemas/library"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [{ user }, params] = await Promise.all([
    requireAuthorizedSession(),
    searchParams,
  ])
  const parsed = parseLibraryQuery(params)
  const query = parsed.success ? parsed.data : libraryQuery.parse({})
  const result = parsed.success
    ? await listArticles(user.id, query)
    : { items: [], hasNext: false }
  const filtered = Object.keys(params).some(
    (key) => key !== "sort" && !!params[key]
  )
  return (
    <section className="mx-auto max-w-3xl space-y-3 py-2 sm:space-y-4 sm:py-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Library
        </h1>
        <Link
          href="/topics"
          className="digest-panel inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:border-teal-600"
        >
          Topics
        </Link>
      </div>
      <LibraryFilters query={query} />
      <LibraryActiveFilters query={query} />
      {!parsed.success ? (
        <p role="alert" className="digest-panel rounded-xl p-4">
          Check the search filters and date ranges.
        </p>
      ) : result.items.length === 0 ? (
        <p className="digest-panel rounded-xl p-4 text-sm">
          {filtered
            ? "No articles match this page or its filters."
            : "Save an article from ChatGPT to start your library."}
        </p>
      ) : (
        <ul className="space-y-2">
          {result.items.map((article) => (
            <LibraryArticle key={article.id} article={article} />
          ))}
        </ul>
      )}
      {(query.page > 1 || result.hasNext) && (
        <nav
          aria-label="Library pages"
          className="flex items-center justify-between gap-3 text-sm"
        >
          {query.page > 1 && (
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={libraryPageHref(query, query.page - 1)}
            >
              Previous
            </Link>
          )}
          <span>Page {query.page}</span>
          {!!result.hasNext && (
            <Link
              className="inline-flex min-h-11 items-center underline"
              href={libraryPageHref(query, query.page + 1)}
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </section>
  )
}
