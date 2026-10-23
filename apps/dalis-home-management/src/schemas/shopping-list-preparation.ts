import { z } from "zod"
import { inventoryItemIdSchema } from "@/schemas/inventory-item"
import { weekStartSchema } from "@/schemas/weekly-meal-plan"

const adjustableQuantitySchema = z.number().finite().min(0).max(999_999)

export const shoppingListPreparationItemSchema = z
  .object({
    inventoryItemId: inventoryItemIdSchema,
    inventoryQuantity: adjustableQuantitySchema,
    shoppingQuantity: adjustableQuantitySchema,
  })
  .strict()

export const shoppingListPreparationInputSchema = z
  .object({
    weekStart: weekStartSchema,
    items: z.array(shoppingListPreparationItemSchema).max(500),
  })
  .strict()
  .superRefine((input, context) => {
    const inventoryItemIds = new Set<string>()

    for (const [index, item] of input.items.entries()) {
      if (inventoryItemIds.has(item.inventoryItemId)) {
        context.addIssue({
          code: "custom",
          message: "Inventory items must be unique",
          path: ["items", index, "inventoryItemId"],
        })
      }
      inventoryItemIds.add(item.inventoryItemId)
    }
  })
