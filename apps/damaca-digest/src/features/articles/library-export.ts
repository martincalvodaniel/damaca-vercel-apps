import "server-only"

import {
  articleExport,
  articleMarkdown,
} from "@/features/articles/article-export"
import { iterateLibraryArticles } from "@/lib/db/articles"
import { createTopicLabelResolver } from "@/lib/db/topics"

export type ExportFormat = "json" | "md"

export function exportHeaders(format: ExportFormat, fileName: string) {
  return {
    "Content-Type":
      format === "json"
        ? "application/json; charset=utf-8"
        : "text/markdown; charset=utf-8",
    "Content-Disposition": `attachment; filename="${fileName}.${format}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  }
}

export async function createLibraryExport(
  ownerId: string,
  format: ExportFormat
) {
  const labels = await createTopicLabelResolver(ownerId)
  const articles = iterateLibraryArticles(ownerId)
  const encoder = new TextEncoder()
  const json = format === "json"
  let first = true

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(json ? "[\n" : "# Damaca Digest\n\n"))
    },
    async pull(controller) {
      const next = await articles.next()
      if (next.done) {
        if (json) controller.enqueue(encoder.encode("\n]\n"))
        controller.close()
        return
      }

      const { value: article } = next
      const snapshot = articleExport(
        article,
        labels(article.topicIds, article.proposedTopics ?? [])
      )
      const separator = first ? "" : json ? ",\n" : "\n---\n\n"
      controller.enqueue(
        encoder.encode(
          separator +
            (json ? JSON.stringify(snapshot) : articleMarkdown(snapshot, 2))
        )
      )
      first = false
    },
    async cancel() {
      await articles.return(undefined)
    },
  })
}
