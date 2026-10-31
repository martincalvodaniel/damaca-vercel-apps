import { describe, expect, it } from "bun:test"
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
  it("normalizes a valid dish and its ingredients", () => {
    const result = dishInputSchema.parse(validDish)

    expect(result.name).toBe("Lentil stew")
    expect(result.ingredients[0]?.inventoryItemId).toBe(
      "507f1f77bcf86cd799439011"
    )
    expect(result.ingredients).toHaveLength(2)
  })

  it("accepts omitted or empty notes for existing dishes and clearing notes", () => {
    expect(dishInputSchema.parse(validDish).notes).toBeUndefined()
    expect(dishInputSchema.parse({ ...validDish, notes: "  " }).notes).toBe("")
  })

  it("preserves recipe line breaks while trimming outer whitespace", () => {
    expect(
      dishInputSchema.parse({
        ...validDish,
        notes: "  Boil water.\nAdd lentils.  ",
      }).notes
    ).toBe("Boil water.\nAdd lentils.")
  })

  it("limits notes to ten thousand characters and rejects non-text input", () => {
    expect(
      dishInputSchema.safeParse({ ...validDish, notes: "a".repeat(10_000) })
        .success
    ).toBe(true)
    for (const notes of ["a".repeat(10_001), 123, null]) {
      expect(dishInputSchema.safeParse({ ...validDish, notes }).success).toBe(
        false
      )
    }
  })

  it("requires at least one ingredient", () => {
    const result = dishInputSchema.safeParse({
      name: "Empty dish",
      ingredients: [],
    })

    expect(result.success).toBe(false)
  })

  it("rejects duplicate catalog products", () => {
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

  it("rejects malformed inventory links", () => {
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

  it("requires every ingredient to reference a catalog product", () => {
    const result = dishInputSchema.safeParse({
      name: "Soup",
      ingredients: [{ quantity: 1 }],
    })

    expect(result.success).toBe(false)
  })
})
