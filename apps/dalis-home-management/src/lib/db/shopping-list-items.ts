import "server-only"

import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/db/client"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import { findInventoryItemsByIds } from "@/lib/db/inventory-items"
import {
  buildMealPlanShoppingListAdjustmentOperations,
  type MealPlanShoppingListAdjustment,
} from "@/lib/db/meal-plan-shopping-list-adjustment"
import { buildInventoryShoppingListUpdate } from "@/lib/db/shopping-list-item-update"
import type { InventoryItem } from "@/schemas/inventory-item"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"

interface ShoppingListItemDocument
  extends Omit<
    ShoppingListItem,
    "id" | "inventoryItemId" | "isMealPlanGenerated"
  > {
  _id: ObjectId
  inventoryItemId: ObjectId
  isMealPlanGenerated?: boolean
  settlementState?: "processing"
}

function toShoppingListItem(
  document: ShoppingListItemDocument,
  inventoryItemsById: ReadonlyMap<string, InventoryItem>
): ShoppingListItem {
  const inventoryItemId = document.inventoryItemId.toHexString()
  const inventoryItem = inventoryItemsById.get(inventoryItemId)
  return {
    id: document._id.toHexString(),
    name: inventoryItem?.name ?? document.name,
    quantity: document.quantity,
    unit: inventoryItem?.unit ?? document.unit,
    isMealPlanGenerated: document.isMealPlanGenerated ?? false,
    isPurchased: document.isPurchased,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    inventoryItemId,
  }
}

async function loadInventoryItemsById(
  documents: readonly ShoppingListItemDocument[]
): Promise<Map<string, InventoryItem>> {
  const ids = documents.flatMap((document) => [
    document.inventoryItemId.toHexString(),
  ])
  const inventoryItems = await findInventoryItemsByIds(ids)

  return new Map(inventoryItems.map((item) => [item.id, item]))
}

function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export async function listShoppingListItems(): Promise<ShoppingListItem[]> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const documents = await collection
    .find({})
    .sort({ isPurchased: 1, createdAt: 1 })
    .toArray()
  const inventoryItemsById = await loadInventoryItemsById(documents)

  return documents.map((document) =>
    toShoppingListItem(document, inventoryItemsById)
  )
}

export async function isInventoryItemUsedInShoppingList(
  inventoryItemId: string
): Promise<boolean> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const document = await collection.findOne(
    { inventoryItemId: toObjectId(inventoryItemId) },
    { projection: { _id: 1 } }
  )

  return document !== null
}

export async function addInventoryItemToShoppingList(
  item: InventoryItem,
  quantity = 1
): Promise<void> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const inventoryItemId = toObjectId(item.id)
  const now = new Date()

  await collection.updateOne(
    { inventoryItemId },
    buildInventoryShoppingListUpdate(item, inventoryItemId, now, quantity),
    { upsert: true }
  )
}

export async function applyMealPlanShoppingListAdjustments(
  adjustments: readonly MealPlanShoppingListAdjustment[]
): Promise<void> {
  if (adjustments.length === 0) {
    return
  }

  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const operations = buildMealPlanShoppingListAdjustmentOperations(
    adjustments,
    new Date()
  )

  await collection.bulkWrite(operations)
}

export async function setShoppingListItemPurchased(
  id: string,
  isPurchased: boolean
): Promise<boolean> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const result = await collection.updateOne(
    { _id: toObjectId(id), settlementState: { $exists: false } },
    { $set: { isPurchased, updatedAt: new Date() } }
  )

  return result.matchedCount > 0
}

export async function setShoppingListItemQuantity(
  id: string,
  quantity: number
): Promise<boolean> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const result = await collection.updateOne(
    { _id: toObjectId(id), settlementState: { $exists: false } },
    {
      $set: {
        quantity,
        isMealPlanGenerated: false,
        updatedAt: new Date(),
      },
    }
  )

  return result.matchedCount > 0
}

export async function deleteShoppingListItem(id: string): Promise<boolean> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const result = await collection.deleteOne({
    _id: toObjectId(id),
    settlementState: { $exists: false },
  })

  return result.deletedCount > 0
}

export async function clearShoppingListItems(): Promise<number> {
  const collection = await getCollection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const result = await collection.deleteMany({
    settlementState: { $exists: false },
  })

  return result.deletedCount
}

export class PurchasedShoppingListSettlementError extends Error {
  constructor() {
    super("Could not settle all purchased shopping-list items")
    this.name = "PurchasedShoppingListSettlementError"
  }
}

export async function restockAndDeletePurchasedShoppingListItems(
  ids: readonly string[]
): Promise<number> {
  const database = await getDatabase()
  const shoppingListCollection = database.collection<ShoppingListItemDocument>(
    COLLECTION_NAMES.shoppingListItems
  )
  const inventoryCollection = database.collection<{
    _id: ObjectId
    quantity: number
    updatedAt: Date
    shoppingListSettlementIds?: ObjectId[]
  }>(COLLECTION_NAMES.inventoryItems)
  const requestedIds = ids.map(toObjectId)
  const purchasedItems = await shoppingListCollection
    .find(
      { _id: { $in: requestedIds }, isPurchased: true },
      { projection: { _id: 1, inventoryItemId: 1, quantity: 1 } }
    )
    .toArray()

  if (purchasedItems.length === 0) {
    return 0
  }

  const inventoryItemIds = purchasedItems.map((item) => item.inventoryItemId)
  const inventoryItemCount = await inventoryCollection.countDocuments({
    _id: { $in: inventoryItemIds },
  })

  if (inventoryItemCount !== new Set(inventoryItemIds.map(String)).size) {
    throw new PurchasedShoppingListSettlementError()
  }

  let settledCount = 0

  for (const item of purchasedItems) {
    const now = new Date()
    const claimedItem = await shoppingListCollection.findOneAndUpdate(
      { _id: item._id, isPurchased: true },
      { $set: { settlementState: "processing", updatedAt: now } },
      { returnDocument: "after" }
    )

    if (!claimedItem) {
      continue
    }

    const inventoryResult = await inventoryCollection.updateOne(
      {
        _id: claimedItem.inventoryItemId,
        shoppingListSettlementIds: { $ne: claimedItem._id },
      },
      {
        $inc: { quantity: claimedItem.quantity },
        $set: { updatedAt: now },
        $addToSet: { shoppingListSettlementIds: claimedItem._id },
      }
    )

    if (inventoryResult.matchedCount === 0) {
      const alreadyApplied = await inventoryCollection.countDocuments({
        _id: claimedItem.inventoryItemId,
        shoppingListSettlementIds: claimedItem._id,
      })

      if (alreadyApplied === 0) {
        throw new PurchasedShoppingListSettlementError()
      }
    }

    const deleteResult = await shoppingListCollection.deleteOne({
      _id: claimedItem._id,
      isPurchased: true,
      settlementState: "processing",
    })

    if (deleteResult.deletedCount === 0) {
      const itemStillExists = await shoppingListCollection.countDocuments({
        _id: claimedItem._id,
      })

      if (itemStillExists > 0) {
        throw new PurchasedShoppingListSettlementError()
      }
    }

    settledCount += 1
  }

  return settledCount
}
