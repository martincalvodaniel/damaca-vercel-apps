import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { z } from "zod"
import { getAuthEnv } from "@/config/env"

export const resetCookie = "damaca-vault-reset"
export const resetDuration = 600_000

const proofSchema = z.strictObject({
  owner: z.string(),
  resetId: z.uuid(),
  session: z.string(),
  revision: z.number().int().positive(),
  expires: z.number().int(),
  purpose: z.enum(["reset", "contacts"]),
  stage: z.enum(["intent", "grant"]),
})

type ResetProof = z.infer<typeof proofSchema>

function signature(value: string) {
  return createHmac("sha256", getAuthEnv().secret)
    .update(`vault-reset:${value}`)
    .digest()
}

export function signResetProof(proof: ResetProof) {
  const value = Buffer.from(JSON.stringify(proof)).toString("base64url")
  return `${value}.${signature(value).toString("base64url")}`
}

export function readResetProof(cookie?: string) {
  const [value, mac, extra] = cookie?.split(".") ?? []
  if (!value || !mac || extra !== undefined) return
  try {
    const candidate = Buffer.from(mac, "base64url")
    const expected = signature(value)
    if (
      candidate.length !== expected.length ||
      !timingSafeEqual(candidate, expected)
    )
      return
    const result = proofSchema.safeParse(
      JSON.parse(Buffer.from(value, "base64url").toString())
    )
    if (result.success && result.data.expires > Date.now()) return result.data
  } catch {
    return
  }
}
