import { z } from "zod"

export const fetchProvider = z.enum(["direct", "jina", "firecrawl"])
export const fetchReason = z.enum([
  "disabled",
  "policy",
  "quota",
  "budget",
  "timeout",
  "network",
  "http_error",
  "rate_limited",
  "credits",
  "unsupported",
  "too_large",
  "invalid_response",
  "blocked",
  "no_content",
  "partial",
  "truncated",
])
export const fetchAttempt = z.strictObject({
  provider: fetchProvider,
  status: z.enum(["full", "partial", "failed", "skipped"]),
  durationMs: z.number().int().min(0).max(45_000),
  httpStatus: z.number().int().min(100).max(599).optional(),
  reason: fetchReason.optional(),
})
export const fetchDiagnostics = z.strictObject({
  provider: fetchProvider.optional(),
  attempts: z.array(fetchAttempt).max(3),
  durationMs: z.number().int().min(0).max(45_000),
  truncated: z.boolean(),
})

export type FetchAttempt = z.infer<typeof fetchAttempt>
export type FetchDiagnostics = z.infer<typeof fetchDiagnostics>
