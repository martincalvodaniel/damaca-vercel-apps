import Link from "next/link"
import { AccessBadge } from "@/features/articles/components/access-badge"
import type { Article } from "@/lib/db/articles"
import { type LibraryQuery, libraryPageHref } from "@/schemas/library"

export function LibraryArticle({
  article,
  topics,
  query,
}: {
  article: Article
  topics: string[]
  query: LibraryQuery
}) {
  const published = article.publishedAt?.toISOString()
  const source = article.source ?? article.sourceDomain
  const captured = article.capturedAt.toISOString()
  return (
    <li className="digest-panel min-w-0 rounded-xl px-2 pt-2 sm:px-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        <Link
          href={libraryPageHref({ ...query, source }, 1)}
          aria-label={`Filter by source: ${source}`}
          className="inline-flex min-h-8 min-w-0 items-center break-all font-medium underline underline-offset-2"
        >
          {source}
        </Link>
        {published ? (
          <>
            <span aria-hidden="true">·</span>
            <time dateTime={published}>{published.slice(0, 10)}</time>
          </>
        ) : null}
        {article.favorite ? (
          <span className="font-medium text-teal-800 dark:text-teal-300">
            ★ Favorite
          </span>
        ) : null}
      </div>
      <Link
        href={`/articles/${article.id}`}
        className="group block min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <h2 className="mt-1.5 break-words text-base font-semibold leading-snug tracking-tight group-hover:text-teal-800 sm:text-lg dark:group-hover:text-teal-300">
          {article.title ?? article.sourceDomain}
        </h2>
        {article.summary ? (
          <p className="mt-1.5 line-clamp-2 break-words text-sm text-zinc-700 dark:text-zinc-300">
            {article.summary}
          </p>
        ) : null}
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-x-2">
        <Link
          href={libraryPageHref(
            {
              ...query,
              access: [
                ...new Set([...(query.access ?? []), article.accessStatus]),
              ],
            },
            1
          )}
          className="inline-flex min-h-8 items-center hover:underline"
          aria-label={`Filter by source access: ${article.accessStatus}`}
        >
          <AccessBadge status={article.accessStatus} />
        </Link>
        <Link
          href={libraryPageHref(
            {
              ...query,
              reading: [
                ...new Set([...(query.reading ?? []), article.readingStatus]),
              ],
            },
            1
          )}
          className="inline-flex min-h-8 items-center text-xs capitalize underline underline-offset-2"
          aria-label={`Filter by reading status: ${article.readingStatus}`}
        >
          {article.readingStatus}
        </Link>
        {article.language ? (
          <Link
            href={libraryPageHref(
              {
                ...query,
                language: [
                  ...new Set([...(query.language ?? []), article.language]),
                ],
              },
              1
            )}
            className="inline-flex min-h-8 items-center text-xs underline underline-offset-2"
            aria-label={`Filter by language: ${article.language}`}
          >
            {article.language}
          </Link>
        ) : null}
      </div>
      {topics.length ? (
        <div className="flex flex-wrap items-center gap-x-2">
          {topics.slice(0, 2).map((topic) => (
            <Link
              key={topic}
              href={`/?${new URLSearchParams({ topic })}`}
              className="inline-flex min-h-8 max-w-full items-center text-xs"
            >
              <span className="min-w-0 break-words rounded-full bg-teal-50 px-1.5 py-0.5 text-teal-950 hover:underline dark:bg-teal-950 dark:text-teal-100">
                {topic}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center text-xs font-semibold underline underline-offset-4"
        >
          Original{" "}
          <span aria-hidden="true" className="ms-1">
            ↗
          </span>
        </a>
        {[...new Set(article.authors)].map((author) => (
          <Link
            key={author}
            href={libraryPageHref({ ...query, author }, 1)}
            className="inline-flex min-h-8 max-w-full items-center break-words text-xs text-zinc-700 underline underline-offset-2 dark:text-zinc-300"
          >
            <span className="min-w-0 break-words">{author}</span>
          </Link>
        ))}
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Captured <time dateTime={captured}>{captured.slice(0, 10)}</time>
        </p>
      </div>
    </li>
  )
}
