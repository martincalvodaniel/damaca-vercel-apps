import { z } from "zod"

export const accessEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254))

export const userAccessMutationSchema = z
  .object({
    email: accessEmailSchema,
    operation: z.enum(["grant", "revoke"]),
  })
  .strict()

export const userAccessQuerySchema = z
  .object({
    after: accessEmailSchema.optional(),
    requestsAfter: accessEmailSchema.optional(),
  })
  .strict()

export const submitAccessRequestSchema = z
  .object({ operation: z.literal("request") })
  .strict()

export const resolveAccessRequestSchema = z
  .object({
    email: accessEmailSchema,
    requestId: z.uuid(),
    decision: z.enum(["approve", "reject"]),
  })
  .strict()
