import { normalizeArticleUrl } from "@/features/articles/normalize-url"
import { type ArticleCapture, webUrl } from "@/schemas/article"

type ArticleLink = NonNullable<ArticleCapture["relatedLinks"]>[number]

export function normalizeSourceLinks(
  links: Iterable<ArticleLink | undefined>,
  ...articleUrls: string[]
): ArticleLink[] {
  const pageUrl = (url: string) => normalizeArticleUrl(url).split("#")[0]
  const ownPages = new Set(articleUrls.map(pageUrl))
  const results = new Map<string, ArticleLink>()
  for (const link of links) {
    if (link?.origin !== "source" || !webUrl.safeParse(link.url).success)
      continue
    const url = normalizeArticleUrl(link.url)
    if (ownPages.has(pageUrl(url))) continue
    const previous = results.get(url)
    if (!previous || (!previous.title && link.title)) {
      results.set(url, { ...link, url })
    }
  }
  return [...results.values()]
}
