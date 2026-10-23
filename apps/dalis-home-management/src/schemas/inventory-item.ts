import { z } from "zod"
import { quantityUnits } from "@/schemas/quantity-unit"

export { quantityUnits as inventoryItemUnits } from "@/schemas/quantity-unit"

export const purchasePlaceSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .transform((value) => value.replace(/\s+/g, " "))

export const purchasePlacesSchema = z
  .array(purchasePlaceSchema)
  .max(20)
  .superRefine((places, context) => {
    const normalizedPlaces = new Set<string>()

    for (const [index, place] of places.entries()) {
      const normalizedPlace = place.toLocaleLowerCase("es")
      if (normalizedPlaces.has(normalizedPlace)) {
        context.addIssue({
          code: "custom",
          message: "Purchase places must be unique",
          path: [index],
        })
      }
      normalizedPlaces.add(normalizedPlace)
    }
  })

export const inventoryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().finite().min(0).max(999_999),
  unit: z.enum(quantityUnits),
  purchasePlaces: purchasePlacesSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const inventoryItemInputSchema = inventoryItemSchema
  .pick({
    name: true,
    quantity: true,
    unit: true,
    purchasePlaces: true,
  })
  .strict()

export const catalogProductInputSchema = inventoryItemSchema
  .pick({
    name: true,
    unit: true,
    purchasePlaces: true,
  })
  .strict()

export const inventoryItemIdSchema = z.string().regex(/^[0-9a-f]{24}$/i)
export const inventoryItemQuantitySchema = inventoryItemSchema.shape.quantity

export type InventoryItem = z.infer<typeof inventoryItemSchema>
export type InventoryItemInput = z.infer<typeof inventoryItemInputSchema>
