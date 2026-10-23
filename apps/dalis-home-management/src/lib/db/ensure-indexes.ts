import "server-only"

import type {
  Collection,
  CreateIndexesOptions,
  IndexSpecification,
} from "mongodb"
import { MongoServerError } from "mongodb"

export interface IndexDatabase {
  collection(name: string): Pick<Collection, "createIndex" | "dropIndex">
}

export interface IndexSpec {
  collection: string
  keys: IndexSpecification
  options: CreateIndexesOptions & { name: string }
}

export interface ObsoleteIndexSpec {
  collection: string
  name: string
}

export const OBSOLETE_INDEX_SPECS: readonly ObsoleteIndexSpec[] = [
  {
    collection: "inventory_items",
    name: "normalized_name_asc_unit_asc",
  },
  {
    collection: "shopping_list_items",
    name: "meal_plan_ingredient_key_unique",
  },
  {
    collection: "inventory_items",
    name: "location_asc_name_asc",
  },
  {
    collection: "inventory_items",
    name: "purchase_place_asc_name_asc",
  },
]

// Add index specifications here alongside the feature that introduces the
// collection or query pattern. Do not add speculative indexes.
export const INDEX_SPECS: readonly IndexSpec[] = [
  {
    collection: "dishes",
    keys: { name: 1 },
    options: {
      name: "name_asc",
      collation: { locale: "es", strength: 1 },
    },
  },
  {
    collection: "dishes",
    keys: { "ingredients.inventoryItemId": 1 },
    options: { name: "ingredients_inventory_item_id_asc" },
  },
  {
    collection: "inventory_items",
    keys: { name: 1 },
    options: {
      name: "name_asc",
      collation: { locale: "es", strength: 1 },
    },
  },
  {
    collection: "inventory_items",
    keys: { normalizedName: 1, unit: 1 },
    options: {
      name: "normalized_name_asc_unit_unique",
      unique: true,
      partialFilterExpression: { normalizedName: { $type: "string" } },
    },
  },
  {
    collection: "shopping_list_items",
    keys: { isPurchased: 1, createdAt: 1 },
    options: { name: "is_purchased_asc_created_at_asc" },
  },
  {
    collection: "shopping_list_items",
    keys: { inventoryItemId: 1 },
    options: {
      name: "inventory_item_id_unique",
      unique: true,
      partialFilterExpression: { inventoryItemId: { $type: "objectId" } },
    },
  },
  {
    collection: "weekly_meal_plans",
    keys: { weekStart: 1 },
    options: { name: "week_start_unique", unique: true },
  },
  {
    collection: "weekly_meal_plans",
    keys: { "slots.dishId": 1 },
    options: { name: "slots_dish_id_asc" },
  },
]

export function validateIndexSpecs(specs: readonly IndexSpec[]): void {
  const namesByCollection = new Map<string, Set<string>>()

  for (const spec of specs) {
    const collection = spec.collection.trim()
    const name = spec.options.name.trim()

    if (!collection || !name) {
      throw new Error("MongoDB indexes require a collection and a stable name")
    }

    const collectionNames = namesByCollection.get(collection) ?? new Set()
    if (collectionNames.has(name)) {
      throw new Error(`Duplicate MongoDB index name: ${collection}.${name}`)
    }

    collectionNames.add(name)
    namesByCollection.set(collection, collectionNames)
  }
}

export async function ensureIndexes(
  database: IndexDatabase,
  specs: readonly IndexSpec[] = INDEX_SPECS,
  obsoleteSpecs: readonly ObsoleteIndexSpec[] = OBSOLETE_INDEX_SPECS
): Promise<void> {
  validateIndexSpecs(specs)

  for (const spec of specs) {
    await database
      .collection(spec.collection)
      .createIndex(spec.keys, spec.options)
  }

  for (const spec of obsoleteSpecs) {
    try {
      await database.collection(spec.collection).dropIndex(spec.name)
    } catch (error) {
      if (
        !(error instanceof MongoServerError) ||
        (error.code !== 27 && error.codeName !== "IndexNotFound")
      ) {
        throw error
      }
    }
  }
}
