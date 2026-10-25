import { z } from "zod"
import { accessEmailSchema } from "@/schemas/email"

export const appIdSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)

const optionalHttpUrl = z
  .union([
    z.literal(""),
    z.url({ protocol: /^https?$/u }).refine((value) => {
      const url = new URL(value)
      return !url.username && !url.password && !url.hash
    }),
  ])
  .transform((value) => value || null)

export const applicationMutationSchema = z
  .object({
    id: appIdSchema,
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(240),
    productionUrl: optionalHttpUrl,
    preproductionUrl: optionalHttpUrl,
    order: z.coerce.number().int().min(0).max(999),
    active: z.enum(["true", "false"]).transform((value) => value === "true"),
  })
  .strict()

export const applicationAccessMutationSchema = z
  .object({
    appId: appIdSchema,
    email: accessEmailSchema,
    operation: z.enum(["grant", "revoke"]),
  })
  .strict()

export const applicationRequestMutationSchema = z
  .object({ appId: appIdSchema, operation: z.literal("request") })
  .strict()

export const applicationRequestReviewSchema = z
  .object({
    appId: appIdSchema,
    email: accessEmailSchema,
    requestId: z.uuid(),
    decision: z.enum(["approve", "reject"]),
  })
  .strict()
