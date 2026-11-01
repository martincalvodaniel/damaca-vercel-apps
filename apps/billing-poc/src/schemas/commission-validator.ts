import { z } from "zod"
import { PAYMENT_METHODS } from "@/lib/domain/entities/payment"

const idSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID")
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => value || undefined)
export const commissionConceptSchema = z.object({
  productId: idSchema.optional(),
  name: z.string().trim().min(1, "Concept name is required"),
  amount: z.number().finite(),
  quantity: z.number().finite().positive("Quantity must be positive"),
})
const fields = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalText,
  clientId: z
    .union([idSchema, z.literal(""), z.null()])
    .optional()
    .transform((value) => value || undefined),
  dueDate: z
    .union([z.iso.date(), z.literal(""), z.null()])
    .optional()
    .transform((value) => value || undefined),
  paymentStatus: z.union([z.literal(0), z.literal(50), z.literal(100)]),
  concepts: z.array(commissionConceptSchema),
  vat: z.number().finite().min(0).max(100),
})
export const createCommissionSchema = fields.extend({
  paymentStatus: fields.shape.paymentStatus.default(0),
  concepts: fields.shape.concepts.default([]),
  vat: fields.shape.vat.default(21),
})
export const updateCommissionSchema = fields.partial().extend({ id: idSchema })
export const commissionIdSchema = z.object({ id: idSchema })
export const generateCommissionPaymentSchema = z.object({
  paymentMethod: z.enum(PAYMENT_METHODS),
})
