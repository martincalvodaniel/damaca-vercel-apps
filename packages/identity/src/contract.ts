import { z } from "zod"

export const appIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)

export const hubUserInfoSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.literal(true),
  damaca_app_id: appIdSchema,
  damaca_access: z.boolean(),
  damaca_authorization_available: z.boolean().default(true),
})

export type AccessDecision = "approved" | "denied" | "unavailable"

export function safeCallback(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    /[\\\s]/u.test(value)
  )
    return "/"
  const base = new URL("https://callback.invalid")
  const target = new URL(value, base)
  if (
    target.origin !== base.origin ||
    target.pathname.startsWith("/auth") ||
    target.pathname.startsWith("/api")
  )
    return "/"
  return `${target.pathname}${target.search}${target.hash}`
}
