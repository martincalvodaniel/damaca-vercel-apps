import "server-only"

import { ObjectId } from "mongodb"

export interface InventoryQuantityAdjustment {
  inventoryItemId: string
  quantity: number
}

export function buildInventoryQuantityAdjustmentOperations(
  adjustments: readonly InventoryQuantityAdjustment[],
  now: Date
) {
  return adjustments.map(({ inventoryItemId, quantity }) => ({
    updateOne: {
      filter: { _id: new ObjectId(inventoryItemId) },
      update: { $set: { quantity, updatedAt: now } },
    },
  }))
}
