import {
  articleExport,
  articleMarkdown,
} from "@/features/articles/article-export"
import { getAuthorizedSession } from "@/lib/auth/session"
import { findArticle } from "@/lib/db/articles"
import { articleTopicLabels } from "@/lib/db/topics"
import { articleId } from "@/schemas/article"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const [session, { id }] = await Promise.all([getAuthorizedSession(), params])
  if (!session) return new Response(null, { status: 401 })
  if (!articleId.safeParse(id).success)
    return new Response(null, { status: 404 })

  const format = new URL(request.url).searchParams.get("format")
  if (format !== "md" && format !== "json")
    return new Response(null, { status: 400 })

  const article = await findArticle(session.user.id, id)
  if (!article) return new Response(null, { status: 404 })

  const labels = await articleTopicLabels(
    session.user.id,
    article.topicIds,
    article.proposedTopics ?? []
  )
  const snapshot = articleExport(article, labels)
  const json = format === "json"
  return new Response(
    json ? JSON.stringify(snapshot, null, 2) : articleMarkdown(snapshot),
    {
      headers: {
        "Content-Type": json
          ? "application/json; charset=utf-8"
          : "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="digest-${article.id}.${format}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    }
  )
}
