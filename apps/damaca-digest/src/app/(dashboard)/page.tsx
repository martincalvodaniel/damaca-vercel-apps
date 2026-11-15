import Link from "next/link"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { listRecentArticles } from "@/lib/db/articles"

export default async function LibraryPage() {
  const { user } = await requireAuthorizedSession()
  const articles = await listRecentArticles(user.id)
  return (
    <section className="mx-auto max-w-2xl space-y-3">
      <h1 className="text-2xl font-semibold">Library</h1>
      {articles.length === 0 ? (
        <p>Save an article from ChatGPT to start your library.</p>
      ) : (
        <ul className="space-y-2">
          {articles.map((article) => (
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
    </section>
  )
}
