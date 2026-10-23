import "server-only"

import { MongoServerError, ObjectId } from "mongodb"
import { normalizeProductName } from "@/lib/catalog/product-name"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import {
  buildInventoryQuantityAdjustmentOperations,
  type InventoryQuantityAdjustment,
} from "@/lib/db/inventory-quantity-adjustment"
import type {
  InventoryItem,
  InventoryItemInput,
} from "@/schemas/inventory-item"

interface InventoryItemDocument extends Omit<InventoryItem, "id"> {
  _id: ObjectId
  normalizedName?: string
}

export class DuplicateInventoryItemError extends Error {
  constructor() {
    super("A product with the same normalized name and unit already exists")
    this.name = "DuplicateInventoryItemError"
  }
}

function throwInventoryDuplicate(error: unknown): never {
  if (error instanceof MongoServerError && error.code === 11000) {
    throw new DuplicateInventoryItemError()
  }

  throw error
}

function toInventoryItem(document: InventoryItemDocument): InventoryItem {
  return {
    id: document._id.toHexString(),
    name: document.name,
    quantity: document.quantity,
    unit: document.unit,
    purchasePlaces: document.purchasePlaces,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  }
}

function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export async function listInventoryItems(): Promise<InventoryItem[]> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const documents = await collection
    .find({})
    .sort({ name: 1 })
    .collation({ locale: "es", strength: 1 })
    .toArray()

  return documents.map(toInventoryItem)
}

export async function findInventoryItemById(
  id: string
): Promise<InventoryItem | null> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const document = await collection.findOne({ _id: toObjectId(id) })

  return document ? toInventoryItem(document) : null
}

export async function findInventoryItemsByIds(
  ids: readonly string[]
): Promise<InventoryItem[]> {
  if (ids.length === 0) {
    return []
  }

  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const documents = await collection
    .find({ _id: { $in: [...new Set(ids)].map(toObjectId) } })
    .toArray()

  return documents.map(toInventoryItem)
}

export async function findInventoryItemByNameAndUnit(
  name: string,
  unit: InventoryItem["unit"]
): Promise<InventoryItem | null> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const normalizedName = normalizeProductName(name)
  const normalizedDocument = await collection.findOne({ normalizedName, unit })

  if (normalizedDocument) {
    return toInventoryItem(normalizedDocument)
  }

  const legacyDocument = await collection.findOne(
    { name: name.trim(), unit },
    { collation: { locale: "es", strength: 1 } }
  )

  return legacyDocument ? toInventoryItem(legacyDocument) : null
}

export async function createInventoryItem(
  input: InventoryItemInput
): Promise<string> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const now = new Date()
  try {
    const result = await collection.insertOne({
      _id: new ObjectId(),
      ...input,
      normalizedName: normalizeProductName(input.name),
      createdAt: now,
      updatedAt: now,
    })
    return result.insertedId.toHexString()
  } catch (error) {
    throwInventoryDuplicate(error)
  }
}

export async function updateInventoryItem(
  id: string,
  input: InventoryItemInput
): Promise<boolean> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  try {
    const result = await collection.updateOne(
      { _id: toObjectId(id) },
      {
        $set: {
          ...input,
          normalizedName: normalizeProductName(input.name),
          updatedAt: new Date(),
        },
      }
    )
    return result.matchedCount > 0
  } catch (error) {
    throwInventoryDuplicate(error)
  }
}

export async function markInventoryItemOutOfStock(
  id: string
): Promise<boolean> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { $set: { quantity: 0, updatedAt: new Date() } }
  )

  return result.matchedCount > 0
}

export async function setInventoryItemQuantity(
  id: string,
  quantity: number
): Promise<boolean> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { $set: { quantity, updatedAt: new Date() } }
  )

  return result.matchedCount > 0
}

export async function setInventoryItemQuantities(
  adjustments: readonly InventoryQuantityAdjustment[]
): Promise<void> {
  if (adjustments.length === 0) {
    return
  }

  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const now = new Date()

  await collection.bulkWrite(
    buildInventoryQuantityAdjustmentOperations(adjustments, now)
  )
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const collection = await getCollection<InventoryItemDocument>(
    COLLECTION_NAMES.inventoryItems
  )
  const result = await collection.deleteOne({ _id: toObjectId(id) })

  return result.deletedCount > 0
}
