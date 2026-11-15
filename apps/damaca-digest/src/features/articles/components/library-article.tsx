import Link from "next/link"
import { AccessBadge } from "@/features/articles/components/access-badge"
import type { Article } from "@/lib/db/articles"

export function LibraryArticle({
  article,
  topics,
}: {
  article: Article
  topics: string[]
}) {
  const date = (article.publishedAt ?? article.capturedAt).toISOString()
  const captured = article.capturedAt.toISOString()
  return (
    <li className="digest-panel min-w-0 rounded-xl px-3.5 pt-3.5 sm:px-4 sm:pt-4">
      <Link
        href={`/articles/${article.id}`}
        className="group block min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="min-w-0 break-all font-medium">
            {article.source ?? article.sourceDomain}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={date}>{date.slice(0, 10)}</time>
          {article.favorite ? (
            <span className="font-medium text-teal-800 dark:text-teal-300">
              ★ Favorite
            </span>
          ) : null}
        </div>
        <h2 className="mt-1.5 break-words text-base font-semibold leading-snug tracking-tight group-hover:text-teal-800 sm:text-lg dark:group-hover:text-teal-300">
          {article.title ?? article.sourceDomain}
        </h2>
        {article.summary ? (
          <p className="mt-1.5 line-clamp-2 break-words text-sm text-zinc-700 dark:text-zinc-300">
            {article.summary}
          </p>
        ) : null}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <AccessBadge status={article.accessStatus} />
          {article.readingStatus !== "unread" ? (
            <span className="text-xs capitalize text-zinc-600 dark:text-zinc-400">
              {article.readingStatus}
            </span>
          ) : null}
          {article.authors?.length ? (
            <span className="min-w-0 break-words text-xs text-zinc-600 dark:text-zinc-400">
              {article.authors.join(", ")}
            </span>
          ) : null}
        </div>
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-x-2">
        {topics.slice(0, 2).map((topic) => (
          <Link
            key={topic}
            href={`/?${new URLSearchParams({ topic })}`}
            className="inline-flex min-h-11 max-w-full items-center text-xs"
          >
            <span className="min-w-0 break-words rounded-full bg-teal-50 px-2 py-1 text-teal-950 hover:underline dark:bg-teal-950 dark:text-teal-100">
              {topic}
            </span>
          </Link>
        ))}
        <a
          href={article.url}
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-xs font-semibold underline underline-offset-4"
        >
          Original{" "}
          <span aria-hidden="true" className="ms-1">
            ↗
          </span>
        </a>
        {!!article.publishedAt && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Captured <time dateTime={captured}>{captured.slice(0, 10)}</time>
          </p>
        )}
      </div>
    </li>
  )
}
