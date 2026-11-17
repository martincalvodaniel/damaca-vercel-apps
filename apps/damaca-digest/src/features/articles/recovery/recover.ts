import "server-only"

import type { getArticleFetchEnv } from "@/config/env"
import { type FetchAttempt, fetchProvider } from "@/schemas/article-fetch"
import { providerUrl, RecoveryError, recoveryUrl } from "./network"
import { type Candidate, fetchCandidate } from "./providers"

type Config = ReturnType<typeof getArticleFetchEnv>

const blocked =
  /\b(?:paywall|access denied|forbidden|permission denied|verify (?:that )?you are (?:a )?human|sign in to (?:continue|read)|log in to (?:continue|read)|subscribe to (?:continue|read)|just a moment)\b/i
const challenge =
  /^(?:\s|[#>*-])*(?:captcha|just a moment|checking your browser|verify (?:that )?you are (?:a )?human)\b/i
const errorPage =
  /^(?:\s|[#>*-])*(?:\d{3}\s*[-:]?\s*)?(?:bad gateway|not found|service unavailable|internal server error|page not found|enable javascript|cookie consent)\b/i
const preview =
  /\b(?:continue reading (?:with|by|after)|read the full article|article preview|content truncated)\b/i
const contentLimit = 40_000

export function classify(candidate: Candidate) {
  const content = candidate.content?.trim() ?? ""
  const visible = content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[\s#*_`>|-]+/g, " ")
    .trim()
  const challengePage =
    candidate.challenge ||
    challenge.test(content) ||
    challenge.test(candidate.title ?? "")
  const protectedPage =
    challengePage ||
    blocked.test(candidate.evidence ?? "") ||
    blocked.test(content.slice(0, 600)) ||
    blocked.test(candidate.title ?? "")
  const editorial =
    !challengePage &&
    !errorPage.test(content) &&
    !errorPage.test(candidate.title ?? "") &&
    visible.split(/\s+/).length >= 12 &&
    !(protectedPage && visible.length < 200)
  const truncated = content.length > contentLimit
  if (!editorial)
    return {
      status: "failed",
      reason: protectedPage ? "blocked" : "no_content",
      protectedPage,
      score: 0,
    } as const
  if (
    protectedPage ||
    candidate.partial ||
    preview.test(content) ||
    truncated
  ) {
    return {
      status: "partial",
      reason: protectedPage ? "blocked" : truncated ? "truncated" : "partial",
      protectedPage,
      score: Math.min(visible.length, contentLimit),
      truncated,
      content: content.slice(0, contentLimit),
    } as const
  }
  return {
    status: "full",
    protectedPage,
    score: visible.length,
    truncated: false,
    content,
  } as const
}

export async function recoverArticle(
  input: string,
  config: Config,
  signal: AbortSignal,
  reserveFirecrawl: (signal: AbortSignal) => Promise<boolean>,
  candidateFetcher = fetchCandidate
) {
  recoveryUrl(input)
  const started = performance.now()
  const elapsed = () =>
    Math.min(45_000, Math.round(performance.now() - started))
  const attempts: FetchAttempt[] = []
  let best:
    | (Omit<Candidate, "evidence" | "partial" | "httpStatus" | "challenge"> & {
        provider: FetchAttempt["provider"]
        accessStatus: "full" | "partial"
        truncated: boolean
        accessNotes?: string
      })
    | undefined
  let bestScore = 0
  for (const provider of fetchProvider.options) {
    signal.throwIfAborted()
    const remaining = config.totalMs - (performance.now() - started)
    if (!config.enabled[provider] || remaining < 1) {
      attempts.push({
        provider,
        status: "skipped",
        durationMs: 0,
        reason: remaining < 1 ? "budget" : "disabled",
      })
      continue
    }
    if (provider !== "direct") {
      try {
        providerUrl(input, config.hosts)
      } catch {
        attempts.push({
          provider,
          status: "skipped",
          durationMs: 0,
          reason: "policy",
        })
        continue
      }
    }

    const attemptStart = performance.now()
    const duration = () =>
      Math.min(45_000, Math.round(performance.now() - attemptStart))
    const timeout = AbortSignal.timeout(
      Math.floor(Math.min(remaining, config.providerMs[provider]))
    )
    const attemptSignal = AbortSignal.any([signal, timeout])
    try {
      if (
        provider === "firecrawl" &&
        !(await reserveFirecrawl(attemptSignal).catch(() => false))
      ) {
        attempts.push({
          provider,
          status: "skipped",
          durationMs: duration(),
          reason: "quota",
        })
        continue
      }
      attemptSignal.throwIfAborted()
      const candidate = await candidateFetcher(
        provider,
        input,
        config,
        attemptSignal
      )
      attemptSignal.throwIfAborted()
      const result = classify(candidate)
      attempts.push({
        provider,
        status: result.status,
        durationMs: duration(),
        httpStatus: candidate.httpStatus,
        reason: "reason" in result ? result.reason : undefined,
      })
      if (
        result.status !== "failed" &&
        (result.status === "full" || result.score > bestScore)
      ) {
        const {
          evidence: _,
          partial: _partial,
          challenge: _challenge,
          httpStatus: _httpStatus,
          ...fields
        } = candidate
        best = {
          ...fields,
          provider,
          accessStatus: result.status,
          content: result.content,
          truncated: result.truncated,
          accessNotes:
            result.status === "partial"
              ? `Only partial source content was recovered (${result.reason}).`
              : undefined,
        }
        bestScore = result.score
      }
      if (result.status === "full" || result.protectedPage) break
    } catch (error) {
      signal.throwIfAborted()
      const reason = timeout.aborted
        ? "timeout"
        : error instanceof RecoveryError
          ? error.reason
          : "network"
      if (reason === "policy") throw error
      attempts.push({
        provider,
        status: "failed",
        durationMs: duration(),
        reason,
        httpStatus: error instanceof RecoveryError ? error.status : undefined,
      })
      if (reason === "blocked") break
    }
  }
  const result = { url: input, attempts, durationMs: elapsed() }
  return best
    ? { ...result, ...best }
    : {
        ...result,
        accessStatus: "unavailable" as const,
        truncated: false,
        accessNotes: "No readable source content was recovered.",
      }
}
