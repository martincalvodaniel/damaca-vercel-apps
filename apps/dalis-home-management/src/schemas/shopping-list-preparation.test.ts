import { describe, expect, test } from "bun:test"
import { shoppingListPreparationInputSchema } from "@/schemas/shopping-list-preparation"

const inventoryItemId = "507f1f77bcf86cd799439011"

function createValidInput() {
  return {
    weekStart: "2026-09-28",
    items: [
      {
        inventoryItemId,
        inventoryQuantity: 2,
        shoppingQuantity: 3,
      },
    ],
  }
}

describe("shopping list preparation input schema", () => {
  test("accepts editable inventory and shopping quantities", () => {
    expect(
      shoppingListPreparationInputSchema.safeParse(createValidInput()).success
    ).toBe(true)
  })

  test("rejects invalid quantities and unknown fields", () => {
    expect(
      shoppingListPreparationInputSchema.safeParse({
        ...createValidInput(),
        items: [
          {
            inventoryItemId,
            inventoryQuantity: -1,
            shoppingQuantity: Number.POSITIVE_INFINITY,
            unexpected: true,
          },
        ],
      }).success
    ).toBe(false)
  })

  test("rejects invalid product identifiers and weeks", () => {
    expect(
      shoppingListPreparationInputSchema.safeParse({
        ...createValidInput(),
        weekStart: "2026-09-29",
        items: [{ ...createValidInput().items[0], inventoryItemId: "invalid" }],
      }).success
    ).toBe(false)
  })

  test("rejects duplicate products", () => {
    const input = createValidInput()

    expect(
      shoppingListPreparationInputSchema.safeParse({
        ...input,
        items: [...input.items, { ...input.items[0] }],
      }).success
    ).toBe(false)
  })

  test("limits the number of editable products", () => {
    expect(
      shoppingListPreparationInputSchema.safeParse({
        ...createValidInput(),
        items: Array.from({ length: 501 }, (_, index) => ({
          inventoryItemId: index.toString(16).padStart(24, "0"),
          inventoryQuantity: 0,
          shoppingQuantity: 0,
        })),
      }).success
    ).toBe(false)
  })
})
