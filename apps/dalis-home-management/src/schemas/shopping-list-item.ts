import { z } from "zod"
import { quantityUnitSchema } from "@/schemas/quantity-unit"

export const shoppingListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().finite().positive().max(999_999),
  unit: quantityUnitSchema,
  inventoryItemId: z.string().regex(/^[0-9a-f]{24}$/i),
  isMealPlanGenerated: z.boolean(),
  isPurchased: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const shoppingListItemInputSchema = shoppingListItemSchema
  .pick({
    quantity: true,
    inventoryItemId: true,
  })
  .required({ inventoryItemId: true })
  .strict()

export const shoppingListItemIdSchema = z.string().regex(/^[0-9a-f]{24}$/i)
export const shoppingListItemPurchasedSchema = z.boolean()
export const shoppingListItemQuantitySchema =
  shoppingListItemSchema.shape.quantity
export const purchasedShoppingListItemIdsSchema = z
  .array(shoppingListItemIdSchema)
  .min(1)
  .max(500)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Purchased shopping-list item IDs must be unique",
  })

export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>
