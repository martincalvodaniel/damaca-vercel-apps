import Link from "next/link"
import { AccessBadge } from "@/features/articles/components/access-badge"
import type { Article } from "@/lib/db/articles"

const sectionTitle = "mb-2 text-lg font-semibold tracking-tight"
const actionLink =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold"

export function ArticleDetail({
  article,
  topics,
}: {
  article: Article
  topics: string[]
}) {
  const details = [
    article.source ?? article.sourceDomain,
    article.authors?.join(", "),
    article.publishedAt?.toISOString().slice(0, 10),
  ]
    .filter(Boolean)
    .join(" · ")
  const captured = article.capturedAt.toISOString()
  const links = new Map(
    article.relatedLinks?.map((link) => [`${link.origin}:${link.url}`, link])
  )

  return (
    <article className="mx-auto max-w-3xl space-y-3 break-words py-2 sm:space-y-4 sm:py-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
          href="/"
        >
          <span aria-hidden="true">←</span> Library
        </Link>
        <Link
          className={`digest-panel ${actionLink} hover:border-teal-600`}
          href={`/articles/${article.id}/edit`}
        >
          Edit article
        </Link>
      </div>
      <header className="digest-panel rounded-xl p-4 sm:p-6">
        <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
          {details}
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {article.title ?? article.sourceDomain}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AccessBadge status={article.accessStatus} />
          <a
            className={`${actionLink} bg-teal-800 text-white hover:bg-teal-900`}
            href={article.url}
            rel="noreferrer"
          >
            Open original{" "}
            <span aria-hidden="true" className="ms-1.5">
              ↗
            </span>
          </a>
        </div>
        {article.accessNotes ? (
          <p className="mt-3 border-s-2 border-amber-500 ps-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {article.accessNotes}
          </p>
        ) : null}
      </header>
      {article.summary || article.keyTakeaways?.length ? (
        <div className="digest-panel space-y-4 rounded-xl p-4 sm:p-6">
          {article.summary ? (
            <section>
              <h2 className={sectionTitle}>Summary</h2>
              <p className="whitespace-pre-wrap leading-relaxed">
                {article.summary}
              </p>
            </section>
          ) : null}
          {article.keyTakeaways?.length ? (
            <section>
              <h2 className={sectionTitle}>Key takeaways</h2>
              <ul className="list-disc space-y-1.5 ps-5 leading-relaxed marker:text-teal-700 dark:marker:text-teal-300">
                {[...new Set(article.keyTakeaways)].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
      {topics.length > 0 || links.size > 0 ? (
        <div className="digest-panel space-y-3 rounded-xl p-4 sm:p-6">
          {topics.length > 0 ? (
            <section aria-label="Topics">
              <h2 className="text-base font-semibold">Topics</h2>
              <ul className="flex flex-wrap gap-x-2">
                {topics.map((label) => (
                  <li key={label} className="max-w-full">
                    <Link
                      href={`/?${new URLSearchParams({ topic: label })}`}
                      className="inline-flex min-h-11 max-w-full items-center"
                    >
                      <span className="break-all rounded-full bg-teal-50 px-2.5 py-1 text-sm text-teal-950 hover:underline dark:bg-teal-950 dark:text-teal-100">
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {links.size > 0 ? (
            <section>
              <h2 className="text-base font-semibold">Links</h2>
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {[...links].map(([key, link]) => (
                  <li
                    key={key}
                    className="flex flex-wrap items-center justify-between gap-x-2"
                  >
                    <a
                      className="inline-flex min-h-11 min-w-0 items-center text-sm underline underline-offset-4"
                      href={link.url}
                      rel="noreferrer"
                    >
                      {link.title ?? link.url}
                    </a>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {link.origin === "source"
                        ? "Source reference"
                        : "AI suggestion"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
      {article.personalNotes ? (
        <section className="digest-panel rounded-xl p-4 sm:p-6">
          <h2 className={sectionTitle}>Personal notes</h2>
          <p className="whitespace-pre-wrap leading-relaxed">
            {article.personalNotes}
          </p>
        </section>
      ) : null}
      <footer className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        <p>
          Reading status: {article.readingStatus}
          {article.favorite ? " · Favorite" : ""}
        </p>
        <p>
          Captured by ChatGPT{" "}
          <time dateTime={captured}>{captured.slice(0, 10)}</time>
        </p>
      </footer>
    </article>
  )
}
