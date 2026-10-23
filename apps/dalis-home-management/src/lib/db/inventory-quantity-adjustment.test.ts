import { describe, expect, test } from "bun:test"
import { ObjectId } from "mongodb"
import { buildInventoryQuantityAdjustmentOperations } from "./inventory-quantity-adjustment"

describe("inventory quantity adjustment operations", () => {
  test("sets each inventory quantity exactly with one timestamp", () => {
    const firstId = "507f1f77bcf86cd799439011"
    const secondId = "507f1f77bcf86cd799439012"
    const now = new Date("2026-10-03T08:00:00.000Z")

    expect(
      buildInventoryQuantityAdjustmentOperations(
        [
          { inventoryItemId: firstId, quantity: 3 },
          { inventoryItemId: secondId, quantity: 0 },
        ],
        now
      )
    ).toEqual([
      {
        updateOne: {
          filter: { _id: new ObjectId(firstId) },
          update: { $set: { quantity: 3, updatedAt: now } },
        },
      },
      {
        updateOne: {
          filter: { _id: new ObjectId(secondId) },
          update: { $set: { quantity: 0, updatedAt: now } },
        },
      },
    ])
  })
})
