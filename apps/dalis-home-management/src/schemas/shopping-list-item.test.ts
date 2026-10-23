import { describe, expect, test } from "bun:test"
import {
  purchasedShoppingListItemIdsSchema,
  shoppingListItemInputSchema,
} from "@/schemas/shopping-list-item"

describe("shoppingListItemInputSchema", () => {
  test("accepts a catalog product and quantity", () => {
    const result = shoppingListItemInputSchema.parse({
      inventoryItemId: "507f1f77bcf86cd799439011",
      quantity: 2,
    })

    expect(result).toEqual({
      inventoryItemId: "507f1f77bcf86cd799439011",
      quantity: 2,
    })
  })

  test("requires a valid catalog product", () => {
    const result = shoppingListItemInputSchema.safeParse({
      inventoryItemId: "invalid",
      quantity: 1,
    })

    expect(result.success).toBe(false)
  })

  test("rejects zero and negative quantities", () => {
    for (const quantity of [0, -1]) {
      const result = shoppingListItemInputSchema.safeParse({
        inventoryItemId: "507f1f77bcf86cd799439011",
        quantity,
      })

      expect(result.success).toBe(false)
    }
  })

  test("keeps product snapshots out of manual item input", () => {
    const result = shoppingListItemInputSchema.safeParse({
      inventoryItemId: "507f1f77bcf86cd799439011",
      quantity: 1,
      name: "Eggs",
      unit: "unit",
    })

    expect(result.success).toBe(false)
  })

  test("keeps generated metadata out of manual item input", () => {
    const result = shoppingListItemInputSchema.safeParse({
      inventoryItemId: "507f1f77bcf86cd799439011",
      quantity: 1,
      isMealPlanGenerated: true,
    })

    expect(result.success).toBe(false)
  })
})

describe("purchasedShoppingListItemIdsSchema", () => {
  test("accepts a unique list of visible purchased items", () => {
    expect(
      purchasedShoppingListItemIdsSchema.safeParse([
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
      ]).success
    ).toBe(true)
  })

  test("rejects empty, duplicated, and malformed item lists", () => {
    expect(purchasedShoppingListItemIdsSchema.safeParse([]).success).toBe(false)
    expect(
      purchasedShoppingListItemIdsSchema.safeParse([
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439011",
      ]).success
    ).toBe(false)
    expect(
      purchasedShoppingListItemIdsSchema.safeParse(["invalid"]).success
    ).toBe(false)
  })
})
