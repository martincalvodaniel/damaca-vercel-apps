import { notFound } from "next/navigation"
import { ArticleDetail } from "@/features/articles/components/article-detail"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { findArticle } from "@/lib/db/articles"
import { articleTopicLabels } from "@/lib/db/topics"
import { articleId } from "@/schemas/article"

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ user }, { id }] = await Promise.all([
    requireAuthorizedSession(),
    params,
  ])
  if (!articleId.safeParse(id).success) notFound()
  const article = await findArticle(user.id, id)
  if (!article) notFound()
  const topics = await articleTopicLabels(
    user.id,
    article.topicIds,
    article.proposedTopics ?? []
  )
  return <ArticleDetail article={article} topics={topics} />
}
