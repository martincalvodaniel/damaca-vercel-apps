import "server-only"

import type { AnyBulkWriteOperation } from "mongodb"
import { ObjectId } from "mongodb"
import type { QuantityUnit } from "@/schemas/quantity-unit"

export interface MealPlanShoppingListAdjustment {
  inventoryItemId: string
  name: string
  unit: QuantityUnit
  quantity: number
}

interface MealPlanShoppingListDocument {
  _id: ObjectId
  inventoryItemId: ObjectId
  name: string
  unit: QuantityUnit
  quantity: number
  isMealPlanGenerated?: boolean
  isPurchased: boolean
  createdAt: Date
  updatedAt: Date
}

export function buildMealPlanShoppingListAdjustmentOperations(
  adjustments: readonly MealPlanShoppingListAdjustment[],
  now: Date
): AnyBulkWriteOperation<MealPlanShoppingListDocument>[] {
  return adjustments.map((adjustment) => {
    const inventoryItemId = new ObjectId(adjustment.inventoryItemId)

    if (adjustment.quantity === 0) {
      return {
        deleteOne: {
          filter: { inventoryItemId, isMealPlanGenerated: true },
        },
      }
    }

    return {
      updateOne: {
        filter: { inventoryItemId },
        update: {
          $set: {
            inventoryItemId,
            name: adjustment.name,
            unit: adjustment.unit,
            quantity: adjustment.quantity,
            isMealPlanGenerated: true,
            isPurchased: false,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        upsert: true,
      },
    }
  })
}
