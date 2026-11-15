import Link from "next/link"
import { notFound } from "next/navigation"
import { removeArticle } from "@/features/articles/actions"
import { ArticleEditor } from "@/features/articles/components/article-editor"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { findArticle } from "@/lib/db/articles"
import { articleId } from "@/schemas/article"

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ deletion?: string }>
}) {
  const [{ user }, { id }, { deletion }] = await Promise.all([
    requireAuthorizedSession(),
    params,
    searchParams,
    searchParams,
  ])
  if (!articleId.safeParse(id).success) notFound()
  const article = await findArticle(user.id, id)
  if (!article) notFound()
  const deleteThisArticle = removeArticle.bind(null, id, article.revision)
  return (
    <section className="mx-auto max-w-2xl space-y-3">
      <Link
        className="inline-flex min-h-11 items-center underline"
        href={`/articles/${id}`}
      >
        Back to article
      </Link>
      <h1 className="text-2xl font-semibold">Edit article</h1>
      <ArticleEditor
        id={article.id}
        revision={article.revision}
        values={{
          title: article.title ?? "",
          authors: article.authors ?? [],
          source: article.source ?? "",
          publishedAt: article.publishedAt?.toISOString().slice(0, 10) ?? "",
          language: article.language ?? "",
          contentType: article.contentType ?? "",
          summary: article.summary ?? "",
          keyTakeaways: article.keyTakeaways ?? [],
          personalNotes: article.personalNotes ?? "",
          readingStatus: article.readingStatus,
          favorite: article.favorite,
        }}
      />
      <details
        open={deletion === "confirm" || deletion === "failed"}
        className="rounded-lg border border-zinc-300 px-3 dark:border-zinc-700"
      >
        <summary className="min-h-11 py-3 text-sm">Delete article</summary>
        <form action={deleteThisArticle} className="space-y-2 pb-3 text-sm">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" name="confirm" value="true" required />{" "}
            Permanently delete this article and its notes
          </label>
          {deletion === "confirm" ? (
            <p role="alert">Confirm that you want to delete this article.</p>
          ) : null}
          {deletion === "failed" ? (
            <p role="alert">
              The article could not be deleted. Reload and try again.
            </p>
          ) : null}
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-red-800 px-4 font-medium text-white"
          >
            Delete article
          </button>
        </form>
      </details>
    </section>
  )
}
