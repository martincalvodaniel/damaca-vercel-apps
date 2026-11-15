import { webUrl } from "@/schemas/article"

type SharedLinkInput = {
  url?: string | string[]
  text?: string | string[]
}

function validUrl(input: string) {
  if (/\s/.test(input.trim())) return null
  const result = webUrl.safeParse(input)
  return result.success ? new URL(result.data).href : null
}

export function resolveSharedLink({ url, text }: SharedLinkInput) {
  if (typeof url === "string" && url.trim()) return validUrl(url)
  if (Array.isArray(url) || typeof text !== "string" || text.length > 8192)
    return null

  const completeUrl = validUrl(text)
  if (completeUrl) return completeUrl

  const matches = text.match(/https?:\/\/[^\s<>"']+/gi) ?? []
  const urls = new Set(
    matches.map((match) => validUrl(match.replace(/[),.;!?]+$/, "")))
  )
  if (urls.size !== 1) return null
  return urls.values().next().value ?? null
}

export function capturePrompt(url: string) {
  return `Use @damaca-digest to read this article and save it in my library. Report any access limitations.\n\n${url}`
}
