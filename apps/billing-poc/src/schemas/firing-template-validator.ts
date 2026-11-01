import { z } from "zod"
import { commissionIdSchema } from "./commission-validator"
export const firingTemplateSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  price: z
    .number()
    .finite()
    .nonnegative("El precio debe ser igual o superior a cero"),
})
export const updateFiringTemplateSchema = firingTemplateSchema.extend(
  commissionIdSchema.shape
)
