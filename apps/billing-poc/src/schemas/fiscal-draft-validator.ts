import { z } from "zod"
import { FISCAL_MODELS } from "@/lib/domain/entities/fiscal-draft"
import {
  FISCAL_INPUT_LABELS,
  type FiscalInputName,
} from "@/lib/domain/services/fiscal-draft"

export const draftSelection = z.strictObject({
  year: z.coerce
    .number()
    .int()
    .refine((value) => value === 2026),
  quarter: z.coerce.number().int().min(1).max(4),
  model: z.enum(FISCAL_MODELS),
})
const reason = z.string().trim().min(1).max(500)
export const draftUpdate = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("review"),
    id: z.string().regex(/^[0-9a-f]{24}$/),
    fingerprint: z.string().max(20000),
    date: z.iso.date(),
    classification: z.enum(["ordinary", "excluded"]),
    vatDeductible: z.boolean(),
    incomeTaxDeductible: z.boolean(),
    reason,
    reference: z.string().min(1).max(2048).optional(),
    base: z.number().finite().min(0).max(1e9).optional(),
    vat: z.number().finite().min(0).max(1e9).optional(),
  }),
  z.strictObject({
    action: z.literal("input"),
    name: z.custom<FiscalInputName>(
      (value) =>
        typeof value === "string" && Object.hasOwn(FISCAL_INPUT_LABELS, value)
    ),
    amount: z.number().finite().min(-1e9).max(1e9),
    reason,
  }),
])
export type DraftUpdate = z.infer<typeof draftUpdate>
