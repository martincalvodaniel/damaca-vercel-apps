import "server-only"

import { MongoServerError, ObjectId } from "mongodb"
import type {
  MigrationProduct,
  ProductCatalogMigrationStore,
} from "@/lib/catalog/product-catalog-migration"
import { normalizeProductName } from "@/lib/catalog/product-name"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import type { InventoryItem } from "@/schemas/inventory-item"
import type { QuantityUnit } from "@/schemas/quantity-unit"

interface InventoryMigrationDocument {
  _id: ObjectId
  name: string
  quantity: number
  unit: QuantityUnit
  purchasePlaces: InventoryItem["purchasePlaces"]
  normalizedName?: string
  createdAt: Date
  updatedAt: Date
}

interface IngredientMigrationDocument {
  id: string
  name: string
  quantity: number
  unit: QuantityUnit
  inventoryItemId?: ObjectId
}

interface DishMigrationDocument {
  _id: ObjectId
  ingredients: IngredientMigrationDocument[]
  updatedAt: Date
}

interface ShoppingMigrationDocument {
  _id: ObjectId
  name: string
  quantity: number
  unit: QuantityUnit
  inventoryItemId?: ObjectId
  mealPlanIngredientKey?: string
  isPurchased: boolean
  isMealPlanGenerated?: boolean
  mergedLegacyItemIds?: ObjectId[]
  createdAt: Date
  updatedAt: Date
}

function toMigrationProduct(
  document: InventoryMigrationDocument
): MigrationProduct {
  return {
    id: document._id.toHexString(),
    name: document.name,
    unit: document.unit,
    normalizedName: document.normalizedName,
  }
}

export function createMongoProductCatalogMigrationStore(): ProductCatalogMigrationStore {
  return {
    async listProducts() {
      const collection = await getCollection<InventoryMigrationDocument>(
        COLLECTION_NAMES.inventoryItems
      )
      return (await collection.find({}).toArray()).map(toMigrationProduct)
    },
    async setProductNormalizedName(id, normalizedName) {
      const collection = await getCollection<InventoryMigrationDocument>(
        COLLECTION_NAMES.inventoryItems
      )
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { normalizedName } }
      )
    },
    async createProduct(name, unit) {
      const collection = await getCollection<InventoryMigrationDocument>(
        COLLECTION_NAMES.inventoryItems
      )
      const now = new Date()
      const document: InventoryMigrationDocument = {
        _id: new ObjectId(),
        name,
        normalizedName: normalizeProductName(name),
        quantity: 0,
        unit,
        purchasePlaces: [],
        createdAt: now,
        updatedAt: now,
      }
      await collection.insertOne(document)
      return toMigrationProduct(document)
    },
    async listLegacyIngredients() {
      const collection = await getCollection<DishMigrationDocument>(
        COLLECTION_NAMES.dishes
      )
      const documents = await collection
        .find({
          ingredients: { $elemMatch: { inventoryItemId: { $exists: false } } },
        })
        .toArray()

      return documents.flatMap((document) =>
        document.ingredients
          .filter((ingredient) => !ingredient.inventoryItemId)
          .map((ingredient) => ({
            id: ingredient.id,
            dishId: document._id.toHexString(),
            name: ingredient.name,
            unit: ingredient.unit,
          }))
      )
    },
    async linkIngredient(reference, product) {
      const collection = await getCollection<DishMigrationDocument>(
        COLLECTION_NAMES.dishes
      )
      const result = await collection.updateOne(
        {
          _id: new ObjectId(reference.dishId),
          ingredients: {
            $elemMatch: {
              id: reference.id,
              inventoryItemId: { $exists: false },
            },
          },
        },
        {
          $set: {
            "ingredients.$.inventoryItemId": new ObjectId(product.id),
            "ingredients.$.name": product.name,
            "ingredients.$.unit": product.unit,
            updatedAt: new Date(),
          },
        }
      )
      return result.modifiedCount > 0
    },
    async listLegacyShoppingItems() {
      const collection = await getCollection<ShoppingMigrationDocument>(
        COLLECTION_NAMES.shoppingListItems
      )
      const documents = await collection
        .find({ inventoryItemId: { $exists: false } })
        .toArray()
      return documents.map((document) => ({
        id: document._id.toHexString(),
        name: document.name,
        quantity: document.quantity,
        unit: document.unit,
        isPurchased: document.isPurchased,
        isMealPlanGenerated: document.isMealPlanGenerated ?? false,
      }))
    },
    async hasLinkedShoppingItem(itemId, productId) {
      const collection = await getCollection<ShoppingMigrationDocument>(
        COLLECTION_NAMES.shoppingListItems
      )
      return (
        (await collection.findOne({
          _id: { $ne: new ObjectId(itemId) },
          inventoryItemId: new ObjectId(productId),
        })) !== null
      )
    },
    async mergeShoppingItemCollision(reference, product) {
      const collection = await getCollection<ShoppingMigrationDocument>(
        COLLECTION_NAMES.shoppingListItems
      )
      const legacyItemId = new ObjectId(reference.id)
      const target = await collection.findOne({
        _id: { $ne: legacyItemId },
        inventoryItemId: new ObjectId(product.id),
      })
      if (!target) {
        return "concurrent-change"
      }
      const wasAlreadyMerged = target.mergedLegacyItemIds?.some((id) =>
        id.equals(legacyItemId)
      )
      if (!wasAlreadyMerged) {
        await collection.updateOne(
          {
            _id: target._id,
            mergedLegacyItemIds: { $ne: legacyItemId },
          },
          [
            {
              $set: {
                quantity: {
                  $cond: [
                    { $eq: ["$isPurchased", reference.isPurchased] },
                    { $add: ["$quantity", reference.quantity] },
                    {
                      $cond: [
                        reference.isPurchased,
                        "$quantity",
                        reference.quantity,
                      ],
                    },
                  ],
                },
                name: product.name,
                unit: product.unit,
                isPurchased: {
                  $and: ["$isPurchased", reference.isPurchased],
                },
                isMealPlanGenerated: {
                  $and: [
                    { $ifNull: ["$isMealPlanGenerated", false] },
                    reference.isMealPlanGenerated,
                  ],
                },
                mergedLegacyItemIds: {
                  $setUnion: [
                    { $ifNull: ["$mergedLegacyItemIds", []] },
                    [legacyItemId],
                  ],
                },
                updatedAt: new Date(),
              },
            },
          ]
        )
      }

      const mergedTarget = await collection.findOne({
        _id: target._id,
        mergedLegacyItemIds: legacyItemId,
      })
      if (!mergedTarget) {
        return "concurrent-change"
      }

      await collection.deleteOne({
        _id: legacyItemId,
        inventoryItemId: { $exists: false },
      })
      return "merged"
    },
    async linkShoppingItem(reference, product) {
      const collection = await getCollection<ShoppingMigrationDocument>(
        COLLECTION_NAMES.shoppingListItems
      )
      try {
        const result = await collection.updateOne(
          {
            _id: new ObjectId(reference.id),
            inventoryItemId: { $exists: false },
          },
          {
            $set: {
              inventoryItemId: new ObjectId(product.id),
              name: product.name,
              unit: product.unit,
              updatedAt: new Date(),
            },
            $unset: { mealPlanIngredientKey: "" },
          }
        )
        return result.modifiedCount > 0
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          return false
        }
        throw error
      }
    },
  }
}
