import Link from "next/link"
import type { Article } from "@/lib/db/articles"

export function ArticleDetail({
  article,
  topics,
}: {
  article: Article
  topics: string[]
}) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 break-words">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link className="inline-flex min-h-11 items-center underline" href="/">
          Library
        </Link>
        <Link
          className="inline-flex min-h-11 items-center underline"
          href={`/articles/${article.id}/edit`}
        >
          Edit article
        </Link>
      </div>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {article.title ?? article.sourceDomain}
        </h1>
        <p>
          {[
            article.authors?.join(", "),
            article.source ?? article.sourceDomain,
            article.publishedAt?.toISOString().slice(0, 10),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <a
          className="inline-flex min-h-11 items-center underline"
          href={article.url}
          rel="noreferrer"
        >
          Open original
        </a>
      </header>
      <p>Access reported by ChatGPT: {article.accessStatus}</p>
      {article.accessNotes ? <p>{article.accessNotes}</p> : null}
      {article.summary ? (
        <p className="whitespace-pre-wrap">{article.summary}</p>
      ) : null}
      {!!article.keyTakeaways?.length && (
        <section>
          <h2 className="font-semibold">Key takeaways</h2>
          <ul className="list-disc space-y-1 pl-5">
            {[...new Set(article.keyTakeaways)].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
      {!!article.relatedLinks?.length && (
        <section>
          <h2 className="font-semibold">Links</h2>
          <ul>
            {[
              ...new Map(
                article.relatedLinks.map((link) => [
                  `${link.origin}:${link.url}`,
                  link,
                ])
              ),
            ].map(([key, link]) => (
              <li key={key}>
                <a
                  className="inline-flex min-h-11 items-center underline"
                  href={link.url}
                  rel="noreferrer"
                >
                  {link.title ?? link.url}
                </a>
                {" · "}
                {link.origin === "source"
                  ? "Source reference"
                  : "AI suggestion"}
              </li>
            ))}
          </ul>
        </section>
      )}
      {topics.length > 0 && <p>Topics: {topics.join(", ")}</p>}
      {article.personalNotes ? (
        <section>
          <h2 className="font-semibold">Personal notes</h2>
          <p className="whitespace-pre-wrap">{article.personalNotes}</p>
        </section>
      ) : null}
      <p className="text-sm">
        Reading status: {article.readingStatus}
        {article.favorite ? " · Favorite" : ""}
      </p>
      <p className="text-sm">
        Captured{" "}
        <time dateTime={article.capturedAt.toISOString()}>
          {article.capturedAt.toISOString().slice(0, 10)}
        </time>
      </p>
    </article>
  )
}
