import Link from "next/link"
import { AccessBadge } from "@/features/articles/components/access-badge"
import type { Article } from "@/lib/db/articles"

export function LibraryArticle({ article }: { article: Article }) {
  const date = (article.publishedAt ?? article.capturedAt).toISOString()
  return (
    <li>
      <Link
        href={`/articles/${article.id}`}
        className="digest-panel group block min-w-0 rounded-xl p-3.5 transition-colors hover:border-teal-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:p-4"
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
    </li>
  )
}
