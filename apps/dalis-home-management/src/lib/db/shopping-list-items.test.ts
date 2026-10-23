import { describe, expect, test } from "bun:test"
import { ObjectId } from "mongodb"
import type { InventoryItem } from "@/schemas/inventory-item"
import { buildInventoryShoppingListUpdate } from "./shopping-list-item-update"

describe("inventory shopping-list update", () => {
  test("increments pending items and reactivates purchased items atomically", () => {
    const inventoryItemId = new ObjectId("507f1f77bcf86cd799439011")
    const now = new Date("2026-10-02T08:00:00.000Z")
    const item: InventoryItem = {
      id: inventoryItemId.toHexString(),
      name: "Olive oil",
      quantity: 0,
      unit: "liter",
      purchasePlaces: ["Supermarket"],
      createdAt: now,
      updatedAt: now,
    }

    expect(
      buildInventoryShoppingListUpdate(item, inventoryItemId, now, 2)
    ).toEqual([
      {
        $set: {
          inventoryItemId,
          name: "Olive oil",
          unit: "liter",
          isMealPlanGenerated: false,
          quantity: {
            $cond: [
              { $eq: ["$isPurchased", false] },
              { $add: [{ $ifNull: ["$quantity", 0] }, 2] },
              2,
            ],
          },
          isPurchased: false,
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ])
  })
})
