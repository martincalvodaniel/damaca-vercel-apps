import Link from "next/link"
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
    <section className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Library</h1>
        <Link
          href="/topics"
          className="inline-flex min-h-11 items-center text-sm underline"
        >
          Topics
        </Link>
      </div>
      <LibraryFilters query={query} />
      {!parsed.success ? (
        <p role="alert">Check the search filters and date ranges.</p>
      ) : result.items.length === 0 ? (
        <p>
          {filtered
            ? "No articles match this page or its filters."
            : "Save an article from ChatGPT to start your library."}
        </p>
      ) : (
        <ul className="space-y-2">
          {result.items.map((article) => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.id}`}
                className="block min-h-11 break-words rounded-lg border border-zinc-300 p-3 dark:border-zinc-700"
              >
                <span className="block font-medium">
                  {article.title ?? article.sourceDomain}
                </span>
                <span className="text-sm">
                  {article.source ?? article.sourceDomain} ·{" "}
                  {article.accessStatus}
                </span>
              </Link>
            </li>
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
