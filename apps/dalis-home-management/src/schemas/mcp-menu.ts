import { z } from "zod"
import { isoDateSchema } from "@/schemas/weekly-meal-plan"

export const menuQuerySchema = z
  .strictObject({
    period: z
      .enum(["today", "tomorrow", "last_week", "this_week", "next_week"])
      .optional(),
    date: isoDateSchema.optional(),
    weekOf: isoDateSchema.optional(),
  })
  .refine(
    ({ period, date, weekOf }) =>
      [period, date, weekOf].filter(Boolean).length === 1,
    { message: "Pass exactly one of period, date, or weekOf" }
  )

export type MenuQuery = z.infer<typeof menuQuerySchema>

const mealSchema = z.object({
  status: z.enum(["planned", "unplanned", "unavailable"]),
  dish: z.string().nullable(),
})

export const menuResultSchema = z.object({
  today: isoDateSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  days: z.array(
    z.object({ date: isoDateSchema, lunch: mealSchema, dinner: mealSchema })
  ),
})

export type MenuResult = z.infer<typeof menuResultSchema>
