import type { Article } from "@/lib/db/articles"
import { webUrl } from "@/schemas/article"

export function articleExport(article: Article, topics: string[]) {
  return {
    id: article.id,
    url: article.url,
    canonicalUrl: article.canonicalUrl,
    title: article.title ?? article.sourceDomain,
    source: article.source ?? article.sourceDomain,
    authors: article.authors ?? [],
    publishedAt: article.publishedAt?.toISOString(),
    capturedAt: article.capturedAt.toISOString(),
    accessStatus: article.accessStatus,
    accessNotes: article.accessNotes,
    language: article.language,
    contentType: article.contentType,
    summary: article.summary,
    keyTakeaways: article.keyTakeaways ?? [],
    topics,
    relatedLinks: article.relatedLinks ?? [],
    readingStatus: article.readingStatus,
    favorite: article.favorite,
    personalNotes: article.personalNotes,
  }
}

type ArticleExport = ReturnType<typeof articleExport>

function markdownText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replace(/[\\`*_{}[\]()#+!<>|~.=-]/g, "\\$&")
}

function inlineText(text: string) {
  return markdownText(text.replace(/\s+/g, " ").trim())
}

function markdownLink(label: string, rawUrl: string) {
  const parsed = webUrl.safeParse(rawUrl)
  if (!parsed.success) return inlineText(label)
  const href = new URL(parsed.data).href
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E")
  return `[${inlineText(label)}](<${href}>)`
}

export function articleMarkdown(article: ArticleExport, headingLevel = 1) {
  const heading = "#".repeat(headingLevel)
  const section = "#".repeat(headingLevel + 1)
  const blocks = [
    `${heading} ${inlineText(article.title)}`,
    [
      markdownLink(article.source, article.url),
      ...article.authors.map(inlineText),
      article.publishedAt?.slice(0, 10),
    ]
      .filter(Boolean)
      .join(" · "),
    `Source access reported by ChatGPT: ${article.accessStatus}`,
    article.accessNotes && markdownText(article.accessNotes),
    article.summary && `${section} Summary\n\n${markdownText(article.summary)}`,
    article.keyTakeaways.length &&
      `${section} Key takeaways\n\n${article.keyTakeaways.map((item) => `- ${inlineText(item)}`).join("\n")}`,
    article.topics.length &&
      `${section} Topics\n\n${article.topics.map(inlineText).join(", ")}`,
    article.relatedLinks.length &&
      `${section} Links\n\n${article.relatedLinks.map(({ title, url, origin }) => `- ${markdownLink(title ?? url, url)} (${origin === "source" ? "Source reference" : "AI suggestion"})`).join("\n")}`,
    article.personalNotes &&
      `${section} Personal notes\n\n${markdownText(article.personalNotes)}`,
    `Captured ${article.capturedAt.slice(0, 10)} · Reading status: ${article.readingStatus}${article.favorite ? " · Favorite" : ""}`,
  ]
  return `${blocks.filter(Boolean).join("\n\n")}\n`
}
