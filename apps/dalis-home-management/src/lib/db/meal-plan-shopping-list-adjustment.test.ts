import { describe, expect, test } from "bun:test"
import { ObjectId } from "mongodb"
import { buildMealPlanShoppingListAdjustmentOperations } from "./meal-plan-shopping-list-adjustment"

describe("meal-plan shopping-list adjustment operations", () => {
  test("upserts the exact generated quantity with canonical snapshots", () => {
    const inventoryItemId = "507f1f77bcf86cd799439011"
    const now = new Date("2026-10-03T08:00:00.000Z")

    expect(
      buildMealPlanShoppingListAdjustmentOperations(
        [
          {
            inventoryItemId,
            name: "Olive oil",
            unit: "liter",
            quantity: 2,
          },
        ],
        now
      )
    ).toEqual([
      {
        updateOne: {
          filter: { inventoryItemId: new ObjectId(inventoryItemId) },
          update: {
            $set: {
              inventoryItemId: new ObjectId(inventoryItemId),
              name: "Olive oil",
              unit: "liter",
              quantity: 2,
              isMealPlanGenerated: true,
              isPurchased: false,
              updatedAt: now,
            },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      },
    ])
  })

  test("deletes only generated lines when the adjusted quantity is zero", () => {
    const inventoryItemId = "507f1f77bcf86cd799439011"

    expect(
      buildMealPlanShoppingListAdjustmentOperations(
        [
          {
            inventoryItemId,
            name: "Olive oil",
            unit: "liter",
            quantity: 0,
          },
        ],
        new Date("2026-10-03T08:00:00.000Z")
      )
    ).toEqual([
      {
        deleteOne: {
          filter: {
            inventoryItemId: new ObjectId(inventoryItemId),
            isMealPlanGenerated: true,
          },
        },
      },
    ])
  })
})
