import "server-only"

import { Readability } from "@mozilla/readability"
import { JSDOM, VirtualConsole } from "jsdom"
import TurndownService from "turndown"
import { z } from "zod"
import type { getArticleFetchEnv } from "@/config/env"
import { normalizeSourceLinks } from "@/features/articles/mentioned-links"
import { webUrl } from "@/schemas/article"
import type { FetchDiagnostics } from "@/schemas/article-fetch"
import { editorialContent } from "./content"
import {
  directRequest,
  providerUrl,
  RecoveryError,
  readBounded,
  resolvePublic,
} from "./network"

type HttpFetch = (...args: Parameters<typeof fetch>) => Promise<Response>
type Config = ReturnType<typeof getArticleFetchEnv>
type Provider = NonNullable<FetchDiagnostics["provider"]>

export type Candidate = {
  finalUrl: string
  canonicalUrl?: string
  title?: string
  authors?: string[]
  publishedAt?: string
  language?: string
  source?: string
  content?: string
  evidence?: string
  relatedLinks?: NonNullable<
    import("@/schemas/article").ArticleCapture["relatedLinks"]
  >
  httpStatus?: number
  partial?: boolean
  challenge?: boolean
}

const text = (value: string | null | undefined, max: number) =>
  value?.trim().slice(0, max) || undefined
const validDate = z.iso.datetime({ offset: true })
const validLanguage = /^[a-z]{2,8}(?:-[a-z\d]{1,8})*$/i

function editorialLink(raw: string | null, base: string) {
  if (!raw) return
  const url = URL.parse(raw, base)
  return url && webUrl.safeParse(url.href).success ? url.href : undefined
}

function sourceLink(url: string, title?: string) {
  return { url, title: text(title, 350), origin: "source" as const }
}

export function extractHtml(
  html: string,
  url: string,
  status: number
): Candidate {
  const dom = new JSDOM(html, { url, virtualConsole: new VirtualConsole() })
  try {
    const document = dom.window.document
    const meta = (name: string) =>
      document
        .querySelector(`meta[property="${name}"],meta[name="${name}"]`)
        ?.getAttribute("content")
    const title = text(meta("og:title") ?? document.title, 350)
    const canonical = editorialLink(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
        null,
      url
    )
    const canonicalUrl =
      canonical && new URL(canonical).origin === new URL(url).origin
        ? canonical
        : undefined
    const author = text(meta("author"), 150)
    const publishedAt = validDate.safeParse(meta("article:published_time")).data
    const language = document.documentElement.lang
    const source = text(meta("og:site_name"), 180)
    const restricted =
      document.querySelector(
        'meta[itemprop="isAccessibleForFree"][content="false"]'
      ) ||
      [...document.querySelectorAll('script[type="application/ld+json"]')].some(
        (node) =>
          /"isAccessibleForFree"\s*:\s*(?:false|"false")/i.test(
            node.textContent ?? ""
          )
      )
    const challenge = document.querySelector(
      'form[action*="challenge"], iframe[src*="captcha"], #challenge-form'
    )
    for (const node of document.querySelectorAll(
      "script, style, noscript, iframe, template, [hidden]"
    ))
      node.remove()
    const pageLead = document.body?.textContent?.trim().slice(0, 320) ?? ""
    const parsed = new Readability(document, {
      maxElemsToParse: 20_000,
      charThreshold: 0,
    }).parse()
    const evidence = [
      title,
      restricted && "paywall",
      challenge && "captcha",
      pageLead,
    ]
      .filter(Boolean)
      .join("\n")
    return {
      finalUrl: url,
      canonicalUrl,
      title: title ?? text(parsed?.title, 350),
      authors: author ? [author] : undefined,
      publishedAt,
      language: validLanguage.test(language) ? language : undefined,
      source,
      evidence,
      partial: status === 206,
      challenge: Boolean(challenge),
      httpStatus: status,
      content: parsed?.content
        ? new TurndownService().turndown(parsed.content)
        : undefined,
      relatedLinks: normalizeSourceLinks(
        Array.from(
          parsed?.content
            ? JSDOM.fragment(parsed.content).querySelectorAll("a[href]")
            : []
        ).map((node) => {
          const href = editorialLink(node.getAttribute("href"), url)
          return href
            ? sourceLink(href, node.textContent ?? undefined)
            : undefined
        }),
        url
      ).slice(0, 50),
    }
  } finally {
    dom.window.close()
  }
}

const jinaSchema = z.object({
  code: z.number().optional(),
  status: z.number().optional(),
  warning: z.string().optional(),
  data: z
    .object({
      title: z.string().optional(),
      url: z.string(),
      content: z.string(),
      warning: z.string().optional(),
      publishedTime: z.string().optional(),
    })
    .optional(),
})
const firecrawlSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      markdown: z.string().optional(),
      metadata: z.object({
        url: z.string().optional(),
        sourceURL: z.string().optional(),
        title: z.string().optional(),
        language: z.string().optional(),
        statusCode: z.number().int().min(100).max(599).optional(),
      }),
    })
    .optional(),
})

async function jsonRequest(
  endpoint: string,
  init: RequestInit,
  signal: AbortSignal,
  request: HttpFetch
) {
  const response = await request(endpoint, {
    ...init,
    signal,
    redirect: "error",
    cache: "no-store",
  })
  try {
    if (!response.ok) {
      // These statuses are from the provider. An upstream denial is handled from its result.
      const reason =
        response.status === 402
          ? "credits"
          : response.status === 429
            ? "rate_limited"
            : "http_error"
      throw new RecoveryError(reason, response.status)
    }
    if (!response.body)
      throw new RecoveryError("invalid_response", response.status)
    const bytes = await readBounded(response.body, 2 * 1024 * 1024)
    try {
      return JSON.parse(bytes.toString("utf8")) as unknown
    } catch {
      throw new RecoveryError("invalid_response", response.status)
    }
  } finally {
    if (response.body && !response.body.locked)
      await response.body.cancel().catch(() => undefined)
  }
}

function matchingUrl(
  raw: string | undefined,
  requested: URL,
  hosts: Config["hosts"]
) {
  if (!raw) throw new RecoveryError("invalid_response")
  const url = providerUrl(raw, hosts)
  if (
    url.hostname !== requested.hostname ||
    url.pathname.replace(/\/$/, "") !== requested.pathname.replace(/\/$/, "")
  ) {
    throw new RecoveryError("invalid_response")
  }
  return url.href
}

function markdownLinks(content: string, finalUrl: string) {
  return Array.from(
    editorialContent(content).content.matchAll(
      /(?<!!)\[([^\]\n]{1,350})\]\(([^\s)]{1,4096})\)/g
    ),
    ([, title, raw]) => {
      const href = editorialLink(raw, finalUrl)
      return href ? sourceLink(href, title) : undefined
    }
  )
}

export async function fetchCandidate(
  provider: Provider,
  input: string,
  config: Config,
  signal: AbortSignal,
  request: HttpFetch = fetch,
  resolveHost = resolvePublic
): Promise<Candidate> {
  if (provider === "direct") {
    const fetched = await directRequest(input, signal)
    return extractHtml(fetched.html, fetched.url, fetched.status)
  }
  const url = providerUrl(input, config.hosts)
  await resolveHost(url.hostname, signal)
  if (provider === "jina") {
    const data = await jsonRequest(
      `https://r.jina.ai/${url.href}`,
      {
        headers: {
          Accept: "application/json",
          "X-Retain-Images": "none",
          ...(config.jinaKey
            ? { Authorization: `Bearer ${config.jinaKey}` }
            : {}),
        },
      },
      signal,
      request
    )
    const parsed = jinaSchema.safeParse(data)
    if (!parsed.success) throw new RecoveryError("invalid_response")
    if ([401, 403, 451].includes(parsed.data.code ?? 0))
      throw new RecoveryError("blocked", parsed.data.code)
    if (!parsed.data.data || (parsed.data.code && parsed.data.code !== 200))
      throw new RecoveryError("invalid_response")
    const article = parsed.data.data
    const finalUrl = matchingUrl(article.url, url, config.hosts)
    return {
      finalUrl,
      title: text(article.title, 350),
      publishedAt: validDate.safeParse(article.publishedTime).data,
      content: article.content,
      evidence: [parsed.data.warning, article.warning]
        .filter(Boolean)
        .join("\n"),
      partial: !!(parsed.data.warning || article.warning),
      relatedLinks: normalizeSourceLinks(
        markdownLinks(article.content, finalUrl),
        finalUrl
      ).slice(0, 50),
    }
  }

  const payload = await jsonRequest(
    "https://api.firecrawl.dev/v2/scrape",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url.href,
        formats: ["markdown"],
        onlyMainContent: true,
        proxy: "basic",
        storeInCache: false,
        timeout: config.providerMs.firecrawl,
      }),
    },
    signal,
    request
  )
  const parsed = firecrawlSchema.safeParse(payload)
  if (!parsed.success || !parsed.data.success || !parsed.data.data)
    throw new RecoveryError("invalid_response")
  const { markdown, metadata } = parsed.data.data
  const status = metadata.statusCode
  if (status && [401, 403, 451].includes(status))
    throw new RecoveryError("blocked", status)
  if (status && status >= 400) throw new RecoveryError("http_error", status)
  const finalUrl = matchingUrl(
    metadata.url ?? metadata.sourceURL,
    url,
    config.hosts
  )
  return {
    finalUrl,
    title: text(metadata.title, 350),
    language:
      metadata.language && validLanguage.test(metadata.language)
        ? metadata.language
        : undefined,
    content: markdown,
    httpStatus: status,
    partial: status === 206,
    relatedLinks: normalizeSourceLinks(
      markdownLinks(markdown ?? "", finalUrl),
      finalUrl
    ).slice(0, 50),
  }
}
