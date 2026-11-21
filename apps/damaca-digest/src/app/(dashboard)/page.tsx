import Link from "next/link"
import { redirect } from "next/navigation"
import { RememberedFilters } from "@/components/ui/remembered-filters"
import { LibraryActiveFilters } from "@/features/articles/components/library-active-filters"
import { LibraryArticle } from "@/features/articles/components/library-article"
import { LibraryFilters } from "@/features/articles/components/library-filters"
import {
  filterAccountKey,
  readRememberedFilters,
} from "@/features/filters/filter-cookies"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listArticleLanguages, listArticles } from "@/lib/db/articles"
import { createTopicLabelResolver } from "@/lib/db/topics"
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
  const restore =
    params.reset !== "1" &&
    !Object.keys(libraryQuery.shape).some((key) => params[key] !== undefined)
  const accountKey = filterAccountKey(user.id)
  if (restore) {
    const saved = await readRememberedFilters(accountKey, "/")
    if (saved) redirect(saved)
    if (saved === undefined)
      return <RememberedFilters accountKey={accountKey} path="/" />
  }
  const parsed = parseLibraryQuery(params)
  const query = parsed.success ? parsed.data : libraryQuery.parse({})
  const [result, languages] = await Promise.all([
    parsed.success
      ? listArticles(user.id, query)
      : { items: [], hasNext: false },
    listArticleLanguages(user.id),
  ])
  const appliedHref = libraryPageHref(query, 1)
  const labels = result.items.some(
    (article) => article.topicIds.length || article.proposedTopics?.length
  )
    ? await createTopicLabelResolver(user.id)
    : undefined
  const filtered = Object.keys(params).some(
    (key) => key !== "sort" && key !== "reset" && !!params[key]
  )
  return (
    <section className="mx-auto max-w-3xl space-y-3 py-2 sm:space-y-4 sm:py-5">
      <h1 className="sr-only">Library</h1>
      {parsed.success && !restore ? (
        <RememberedFilters
          accountKey={accountKey}
          path="/"
          applied={appliedHref === "/?reset=1" ? "" : appliedHref}
        />
      ) : null}
      <LibraryFilters key={appliedHref} query={query} languages={languages} />
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
            <LibraryArticle
              key={article.id}
              article={article}
              query={query}
              topics={
                labels?.(article.topicIds, article.proposedTopics ?? []) ?? []
              }
            />
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
