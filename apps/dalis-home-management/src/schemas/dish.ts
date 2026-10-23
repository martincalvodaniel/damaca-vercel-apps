import { z } from "zod"
import { quantityUnitSchema } from "@/schemas/quantity-unit"

const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/i)

export const dishIngredientSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().finite().positive().max(999_999),
  unit: quantityUnitSchema,
  inventoryItemId: objectIdSchema,
})

export const dishIngredientInputSchema = dishIngredientSchema
  .pick({ quantity: true, inventoryItemId: true })
  .required({ inventoryItemId: true })
  .strict()

export const dishSchema = z.object({
  id: objectIdSchema,
  name: z.string().trim().min(1).max(120),
  ingredients: z.array(dishIngredientSchema).min(1).max(30),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const dishInputSchema = z
  .object({
    name: dishSchema.shape.name,
    ingredients: z.array(dishIngredientInputSchema).min(1).max(30),
  })
  .strict()
  .superRefine((dish, context) => {
    const inventoryItemIds = new Set<string>()

    for (const [index, ingredient] of dish.ingredients.entries()) {
      if (inventoryItemIds.has(ingredient.inventoryItemId)) {
        context.addIssue({
          code: "custom",
          message: "Products must be unique within a dish",
          path: ["ingredients", index, "inventoryItemId"],
        })
      }

      inventoryItemIds.add(ingredient.inventoryItemId)
    }
  })

export const dishIdSchema = objectIdSchema

export type Dish = z.infer<typeof dishSchema>
export type DishIngredient = z.infer<typeof dishIngredientSchema>
export type DishInput = z.infer<typeof dishInputSchema>
