import { notFound } from "next/navigation"
import { removeArticle } from "@/features/articles/actions"
import { ArticleEditor } from "@/features/articles/components/article-editor"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { findArticle } from "@/lib/db/articles"
import { articleTopicLabels } from "@/lib/db/topics"
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
  ])
  if (!articleId.safeParse(id).success) notFound()
  const article = await findArticle(user.id, id)
  if (!article) notFound()
  const topics = await articleTopicLabels(
    user.id,
    article.topicIds,
    article.proposedTopics ?? []
  )
  const deleteThisArticle = removeArticle.bind(
    null,
    id,
    article.revision,
    "editor"
  )
  return (
    <section className="mx-auto max-w-3xl space-y-3 py-2 sm:space-y-4 sm:py-5">
      <h1 className="sr-only">Edit article</h1>
      <ArticleEditor
        id={article.id}
        revision={article.revision}
        deleteAction={deleteThisArticle}
        deletion={deletion}
        values={{
          title: article.title ?? "",
          authors: article.authors ?? [],
          source: article.source ?? "",
          publishedAt: article.publishedAt?.toISOString().slice(0, 10) ?? "",
          language: article.language ?? "",
          contentType: article.contentType ?? "",
          summary: article.summary ?? "",
          keyTakeaways: article.keyTakeaways ?? [],
          topics,
          personalNotes: article.personalNotes ?? "",
          readingStatus: article.readingStatus,
          favorite: article.favorite,
        }}
      />
    </section>
  )
}
