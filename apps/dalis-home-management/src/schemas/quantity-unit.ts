import { z } from "zod"

export const quantityUnits = [
  "unit",
  "gram",
  "kilogram",
  "milliliter",
  "liter",
] as const

export const quantityUnitSchema = z.enum(quantityUnits)

export type QuantityUnit = z.infer<typeof quantityUnitSchema>
