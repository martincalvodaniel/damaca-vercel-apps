import Link from "next/link"
import { DigestIcon } from "@/components/ui/digest-icon"
import { removeArticle, setArticleReading } from "@/features/articles/actions"
import { AccessBadge } from "@/features/articles/components/access-badge"
import { normalizeSourceLinks } from "@/features/articles/mentioned-links"
import type { Article, RelatedArticle } from "@/lib/db/articles"
import { nextReadingStatus } from "@/schemas/article"
import { ArticleDeleteButton } from "./article-delete-button"
import { ArticleLinkList } from "./article-link-list"

const sectionTitle = "mb-2 text-lg font-semibold tracking-tight"
export function ArticleDetail({
  article,
  topics,
  related,
  readingUpdateFailed,
  deletion,
}: {
  article: Article
  topics: string[]
  related: RelatedArticle[]
  readingUpdateFailed: boolean
  deletion?: string | string[]
}) {
  const details = [
    article.source ?? article.sourceDomain,
    article.authors?.join(", "),
    article.publishedAt?.toISOString().slice(0, 10),
  ]
    .filter(Boolean)
    .join(" · ")
  const readingAction = setArticleReading.bind(
    null,
    article.id,
    article.revision
  )
  const deleteAction = removeArticle.bind(
    null,
    article.id,
    article.revision,
    "reading"
  )
  const captured = article.capturedAt.toISOString()
  const mentionedLinks = normalizeSourceLinks(
    article.relatedLinks ?? [],
    article.url,
    article.canonicalUrl,
    ...(article.suggestedCanonicalUrl ? [article.suggestedCanonicalUrl] : [])
  )
  const suggestions = [
    ...new Map(
      article.relatedLinks
        ?.filter((link) => link.origin === "ai_suggested")
        .map((link) => [link.url, link])
    ).values(),
  ]

  return (
    <article className="mx-auto max-w-3xl space-y-3 break-words py-2 sm:space-y-4 sm:py-5">
      <header className="digest-panel rounded-xl p-3 sm:p-4">
        <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
          {details}
        </p>
        <h1 className="mt-1 text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
          {article.title ?? article.sourceDomain}
        </h1>
        <div className="mt-1">
          <AccessBadge status={article.accessStatus} />
        </div>
        <fieldset
          aria-label="Article actions"
          className="mt-1 flex min-w-0 flex-wrap items-center"
        >
          <a
            className="digest-icon-button"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original"
            title="Open original"
          >
            <DigestIcon name="original" />
          </a>
          <form action={readingAction} className="flex">
            <button
              className="digest-icon-button"
              type="submit"
              name="readingChange"
              value={article.favorite ? "unfavorite" : "favorite"}
              aria-label="Favorite"
              aria-pressed={article.favorite}
              title={article.favorite ? "Remove favorite" : "Add to favorites"}
            >
              <DigestIcon name="favorite" filled={article.favorite} />
            </button>
            <button
              className="digest-icon-button"
              type="submit"
              name="readingChange"
              value={nextReadingStatus(article.readingStatus)}
              aria-label={`Reading status: ${article.readingStatus}. Change to ${nextReadingStatus(article.readingStatus)}`}
              title={`Reading status: ${article.readingStatus}`}
            >
              <DigestIcon name={article.readingStatus} />
            </button>
          </form>
          <a
            href={`/articles/${article.id}/export?format=md`}
            className="digest-icon-button"
            aria-label="Download Markdown"
            title="Download Markdown"
          >
            <DigestIcon name="markdown" />
          </a>
          <a
            href={`/articles/${article.id}/export?format=json`}
            className="digest-icon-button"
            aria-label="Download JSON"
            title="Download JSON"
          >
            <DigestIcon name="json" />
          </a>
          <Link
            className="digest-icon-button"
            href={`/articles/${article.id}/edit`}
            aria-label="Edit article"
            title="Edit article"
          >
            <DigestIcon name="edit" />
          </Link>
          <ArticleDeleteButton deleteAction={deleteAction} />
        </fieldset>
        {deletion ? (
          <p role="alert" className="mt-2 text-sm">
            {deletion === "confirm"
              ? "Confirm that you want to delete this article."
              : "The article could not be deleted. Reload and try again."}
          </p>
        ) : null}
        {readingUpdateFailed ? (
          <p role="alert" className="mt-2 text-sm">
            The reading update could not be saved. Try again.
          </p>
        ) : null}
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
      {topics.length > 0 ||
      mentionedLinks.length > 0 ||
      suggestions.length > 0 ? (
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
          <ArticleLinkList title="Mentioned links" links={mentionedLinks} />
          <ArticleLinkList title="AI link suggestions" links={suggestions} />
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
      {related.length ? (
        <section className="digest-panel rounded-xl p-4 sm:p-6">
          <h2 className={sectionTitle}>Related articles</h2>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/articles/${item.id}`}
                  className="block min-h-11 py-2 text-sm hover:text-teal-800 dark:hover:text-teal-300"
                >
                  <span className="block font-semibold">{item.title}</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {item.source}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
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
