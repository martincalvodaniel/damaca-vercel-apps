import { describe, expect, test } from "bun:test"
import {
  catalogProductInputSchema,
  inventoryItemInputSchema,
} from "@/schemas/inventory-item"

describe("inventoryItemInputSchema", () => {
  test("normalizes a valid inventory item", () => {
    const result = inventoryItemInputSchema.parse({
      name: "  Olive oil  ",
      quantity: 1.5,
      unit: "liter",
      purchasePlaces: ["  Mercado   central ", "Supermercado"],
    })

    expect(result).toEqual({
      name: "Olive oil",
      quantity: 1.5,
      unit: "liter",
      purchasePlaces: ["Mercado central", "Supermercado"],
    })
  })

  test("accepts zero quantity for out-of-stock items", () => {
    const result = inventoryItemInputSchema.safeParse({
      name: "Coffee",
      quantity: 0,
      unit: "gram",
      purchasePlaces: [],
    })

    expect(result.success).toBe(true)
  })

  test("rejects negative quantities", () => {
    const result = inventoryItemInputSchema.safeParse({
      name: "Coffee",
      quantity: -1,
      unit: "gram",
      purchasePlaces: ["Supermercado"],
    })

    expect(result.success).toBe(false)
  })

  test("rejects unsupported units and duplicated purchase places", () => {
    const result = inventoryItemInputSchema.safeParse({
      name: "Coffee",
      quantity: 1,
      unit: "box",
      purchasePlaces: ["Mercado", "mercado"],
    })

    expect(result.success).toBe(false)
  })
})

describe("catalogProductInputSchema", () => {
  test("accepts catalog identity without stock", () => {
    expect(
      catalogProductInputSchema.parse({
        name: "  Tomatoes  ",
        unit: "kilogram",
        purchasePlaces: ["Greengrocer"],
      })
    ).toEqual({
      name: "Tomatoes",
      unit: "kilogram",
      purchasePlaces: ["Greengrocer"],
    })
  })

  test("keeps stock quantity out of catalog identity input", () => {
    const result = catalogProductInputSchema.safeParse({
      name: "Tomatoes",
      unit: "kilogram",
      purchasePlaces: ["Greengrocer"],
      quantity: 2,
    })

    expect(result.success).toBe(false)
  })
})
