import { libraryPageHref, parseLibraryQuery } from "@/schemas/library"
import { topicSearch } from "@/schemas/topic"

export type FilterPath = "/" | "/topics"

export const filterPaths = ["/", "/topics"] as const

export function filterStorageKey(accountKey: string, path: FilterPath) {
  return `digest:filters:v1:${accountKey}:${path}`
}

export function emptyFilterHref(path: FilterPath) {
  return `${path}?reset=1`
}

export function normalizeRememberedHref(path: FilterPath, href: string) {
  if (!href.startsWith(`${path}?`) || href.includes("#")) return ""
  const params = new URLSearchParams(href.slice(path.length + 1))
  if (path === "/topics") {
    const query = topicSearch.safeParse(params.get("q") ?? undefined)
    return query.success && query.data
      ? `/topics?${new URLSearchParams({ q: query.data })}`
      : ""
  }
  const query = parseLibraryQuery(
    Object.fromEntries(
      [...new Set(params.keys())].map((key) => {
        const values = params.getAll(key)
        return [key, values.length === 1 ? values[0] : values]
      })
    )
  )
  if (!query.success) return ""
  const canonical = libraryPageHref(query.data, 1)
  return canonical === emptyFilterHref(path) ? "" : canonical
}
