import "server-only"

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { z } from "zod"
import { providerUrl } from "./network"

export const externalProvider = z.enum(["jina", "firecrawl"])
export type ExternalProvider = z.infer<typeof externalProvider>

const consent = z.strictObject({
  nonce: z.uuid(),
  expiresAt: z.number().int(),
  providers: z.array(externalProvider).min(1).max(2),
})
const lifetimeMs = 10 * 60_000

export function externalFallbackUrl(input: string) {
  const host = URL.parse(input)?.hostname ?? ""
  return providerUrl(input, new Set([host]))
}

function signature(
  secret: string,
  environment: string,
  ownerId: string,
  url: string,
  payload: string
) {
  return createHmac("sha256", secret)
    .update(
      JSON.stringify([
        "digest-external-fallback-v1",
        environment,
        ownerId,
        url,
        payload,
      ])
    )
    .digest()
}

export function issueFallbackConsent(
  secret: string,
  environment: string,
  ownerId: string,
  url: string,
  providers: ExternalProvider[],
  now = Date.now()
) {
  const expiresAt = now + lifetimeMs
  const payload = Buffer.from(
    JSON.stringify({ nonce: randomUUID(), expiresAt, providers })
  ).toString("base64url")
  const mac = signature(secret, environment, ownerId, url, payload)
  return {
    url,
    providers,
    expiresAt: new Date(expiresAt).toISOString(),
    token: `${payload}.${mac.toString("base64url")}`,
  }
}

export function verifyFallbackConsent(
  token: string,
  secret: string,
  environment: string,
  ownerId: string,
  url: string,
  now = Date.now()
) {
  const [payload, encoded, extra] = token.split(".")
  if (!payload || !encoded || extra !== undefined) return null
  const mac = signature(secret, environment, ownerId, url, payload)
  const supplied = Buffer.from(encoded, "base64url")
  if (
    encoded !== supplied.toString("base64url") ||
    supplied.length !== mac.length ||
    !timingSafeEqual(mac, supplied)
  )
    return null
  try {
    const parsed = consent.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString())
    )
    if (parsed.success && parsed.data.expiresAt > now) return parsed.data
  } catch {
    return null
  }
  return null
}
