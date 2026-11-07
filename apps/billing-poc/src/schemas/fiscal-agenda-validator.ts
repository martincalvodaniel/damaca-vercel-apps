import { z } from "zod"

const date = z.iso
  .date()
  .refine((value) => value >= "2000-01-01" && value <= "2100-12-31")
  .optional()
const exercise = z.number().int().min(2000).max(2100)
export const fiscalYear = z.coerce.number().int().min(2000).max(2100)
export const fiscalId = z.string().min(1).max(100)
const progress = {
  filedOn: date,
  paidOn: date,
  notes: z.string().trim().max(2000).optional(),
  receipt: z.string().trim().max(500).optional(),
}

const manual = z
  .strictObject({
    ...progress,
    title: z.string().trim().min(1).max(120),
    model: z.string().trim().max(20),
    exercise: exercise.optional(),
    period: z.string().trim().max(40),
    filingDue: date,
    debitDue: date,
    paymentDue: date,
  })
  .refine((task) => task.filingDue || task.paymentDue, {
    message: "Indica un vencimiento de presentación o de pago.",
  })

export const fiscalCreate = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("manual"), task: manual }),
  z.strictObject({
    action: z.literal("incorporate"),
    year: exercise,
    ids: z.array(fiscalId).min(1).max(30),
  }),
])

export const fiscalUpdate = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("manual"), id: fiscalId, task: manual }),
  z.strictObject({
    action: z.literal("progress"),
    id: fiscalId,
    progress: z.strictObject({ ...progress, paymentDueOverride: date }),
  }),
  z.strictObject({ action: z.literal("refresh"), id: fiscalId }),
])

export type FiscalCreate = z.infer<typeof fiscalCreate>
export type FiscalUpdate = z.infer<typeof fiscalUpdate>
