import { describe, expect, test } from "bun:test"
import { dishInputSchema } from "@/schemas/dish"

const validDish = {
  name: "  Lentil stew  ",
  ingredients: [
    {
      quantity: 300,
      inventoryItemId: "507f1f77bcf86cd799439011",
    },
    {
      quantity: 2,
      inventoryItemId: "507f1f77bcf86cd799439012",
    },
  ],
}

describe("dishInputSchema", () => {
  test("normalizes a valid dish and its ingredients", () => {
    const result = dishInputSchema.parse(validDish)

    expect(result.name).toBe("Lentil stew")
    expect(result.ingredients[0]?.inventoryItemId).toBe(
      "507f1f77bcf86cd799439011"
    )
    expect(result.ingredients).toHaveLength(2)
  })

  test("requires at least one ingredient", () => {
    const result = dishInputSchema.safeParse({
      name: "Empty dish",
      ingredients: [],
    })

    expect(result.success).toBe(false)
  })

  test("rejects duplicate catalog products", () => {
    const result = dishInputSchema.safeParse({
      name: "Salad",
      ingredients: [
        {
          quantity: 1,
          inventoryItemId: "507f1f77bcf86cd799439011",
        },
        {
          quantity: 2,
          inventoryItemId: "507f1f77bcf86cd799439011",
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test("rejects malformed inventory links", () => {
    const result = dishInputSchema.safeParse({
      ...validDish,
      ingredients: [
        {
          quantity: 300,
          inventoryItemId: "not-an-object-id",
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test("requires every ingredient to reference a catalog product", () => {
    const result = dishInputSchema.safeParse({
      name: "Soup",
      ingredients: [{ quantity: 1 }],
    })

    expect(result.success).toBe(false)
  })
})
