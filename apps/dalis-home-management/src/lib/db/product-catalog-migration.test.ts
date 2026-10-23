import { describe, expect, test } from "bun:test"
import {
  type LegacyIngredientReference,
  type LegacyShoppingReference,
  type MigrationProduct,
  migrateProductCatalogReferences,
  type ProductCatalogMigrationStore,
} from "@/lib/catalog/product-catalog-migration"
import type { QuantityUnit } from "@/schemas/quantity-unit"

class FakeMigrationStore implements ProductCatalogMigrationStore {
  products: MigrationProduct[]
  ingredients: LegacyIngredientReference[]
  shoppingItems: LegacyShoppingReference[]
  linkedShoppingProductIds = new Set<string>()
  collisionResult: "merged" | "concurrent-change" = "merged"
  linkedIngredients: Array<{ referenceId: string; productId: string }> = []
  linkedShoppingItems: Array<{ referenceId: string; productId: string }> = []

  constructor({
    products = [],
    ingredients = [],
    shoppingItems = [],
  }: {
    products?: MigrationProduct[]
    ingredients?: LegacyIngredientReference[]
    shoppingItems?: LegacyShoppingReference[]
  }) {
    this.products = products
    this.ingredients = ingredients
    this.shoppingItems = shoppingItems
  }

  async listProducts() {
    return this.products
  }

  async setProductNormalizedName(id: string, normalizedName: string) {
    this.products = this.products.map((product) =>
      product.id === id ? { ...product, normalizedName } : product
    )
  }

  async createProduct(name: string, unit: QuantityUnit) {
    const product: MigrationProduct = {
      id: `created-${this.products.length + 1}`,
      name,
      unit,
      normalizedName: name.trim().toLocaleLowerCase("es"),
    }
    this.products.push(product)
    return product
  }

  async listLegacyIngredients() {
    return this.ingredients
  }

  async linkIngredient(
    reference: LegacyIngredientReference,
    product: MigrationProduct
  ) {
    this.ingredients = this.ingredients.filter(
      (ingredient) => ingredient.id !== reference.id
    )
    this.linkedIngredients.push({
      referenceId: reference.id,
      productId: product.id,
    })
    return true
  }

  async listLegacyShoppingItems() {
    return this.shoppingItems
  }

  async hasLinkedShoppingItem(_itemId: string, productId: string) {
    return this.linkedShoppingProductIds.has(productId)
  }

  async mergeShoppingItemCollision(reference: LegacyShoppingReference) {
    if (this.collisionResult === "merged") {
      this.shoppingItems = this.shoppingItems.filter(
        (item) => item.id !== reference.id
      )
    }
    return this.collisionResult
  }

  async linkShoppingItem(
    reference: LegacyShoppingReference,
    product: MigrationProduct
  ) {
    this.shoppingItems = this.shoppingItems.filter(
      (item) => item.id !== reference.id
    )
    this.linkedShoppingProductIds.add(product.id)
    this.linkedShoppingItems.push({
      referenceId: reference.id,
      productId: product.id,
    })
    return true
  }
}

describe("product catalog migration", () => {
  test("normalizes products, reuses exact matches, and creates missing products", async () => {
    const store = new FakeMigrationStore({
      products: [{ id: "rice", name: "  Rice ", unit: "gram" }],
      ingredients: [
        {
          id: "ingredient-rice",
          dishId: "dish-1",
          name: "rice",
          unit: "gram",
        },
        {
          id: "ingredient-tomato",
          dishId: "dish-1",
          name: "Tomato",
          unit: "unit",
        },
      ],
      shoppingItems: [
        {
          id: "shopping-tomato",
          name: " tomato ",
          quantity: 2,
          unit: "unit",
          isPurchased: false,
          isMealPlanGenerated: false,
        },
      ],
    })

    const report = await migrateProductCatalogReferences(store)

    expect(report).toEqual({
      normalizedProducts: 1,
      createdProducts: 1,
      linkedIngredients: 2,
      linkedShoppingItems: 1,
      mergedShoppingItems: 0,
      issues: [],
    })
    expect(store.linkedIngredients).toEqual([
      { referenceId: "ingredient-rice", productId: "rice" },
      { referenceId: "ingredient-tomato", productId: "created-2" },
    ])
    expect(store.linkedShoppingItems).toEqual([
      { referenceId: "shopping-tomato", productId: "created-2" },
    ])

    expect(await migrateProductCatalogReferences(store)).toEqual({
      normalizedProducts: 0,
      createdProducts: 0,
      linkedIngredients: 0,
      linkedShoppingItems: 0,
      mergedShoppingItems: 0,
      issues: [],
    })
  })

  test("reports ambiguous products and concurrent shopping-list changes", async () => {
    const store = new FakeMigrationStore({
      products: [
        {
          id: "oil-1",
          name: "Oil",
          unit: "milliliter",
          normalizedName: "oil",
        },
        {
          id: "oil-2",
          name: "oil",
          unit: "milliliter",
          normalizedName: "oil",
        },
        {
          id: "bread",
          name: "Bread",
          unit: "unit",
          normalizedName: "bread",
        },
      ],
      ingredients: [
        {
          id: "ingredient-oil",
          dishId: "dish-1",
          name: "OIL",
          unit: "milliliter",
        },
      ],
      shoppingItems: [
        {
          id: "shopping-bread",
          name: "Bread",
          quantity: 1,
          unit: "unit",
          isPurchased: true,
          isMealPlanGenerated: false,
        },
      ],
    })
    store.linkedShoppingProductIds.add("bread")
    store.collisionResult = "concurrent-change"

    const report = await migrateProductCatalogReferences(store)

    expect(report.linkedIngredients).toBe(0)
    expect(report.linkedShoppingItems).toBe(0)
    expect(report.mergedShoppingItems).toBe(0)
    expect(report.issues).toEqual([
      {
        kind: "ingredient",
        referenceId: "ingredient-oil",
        name: "OIL",
        unit: "milliliter",
        reason: "ambiguous-product",
      },
      {
        kind: "shopping-list",
        referenceId: "shopping-bread",
        name: "Bread",
        unit: "unit",
        reason: "concurrent-change",
      },
    ])
  })

  test("merges shopping-list collisions only once", async () => {
    const store = new FakeMigrationStore({
      products: [
        {
          id: "eggs",
          name: "Eggs",
          unit: "unit",
          normalizedName: "eggs",
        },
      ],
      shoppingItems: [
        {
          id: "legacy-eggs",
          name: "eggs",
          quantity: 6,
          unit: "unit",
          isPurchased: false,
          isMealPlanGenerated: true,
        },
      ],
    })
    store.linkedShoppingProductIds.add("eggs")

    const report = await migrateProductCatalogReferences(store)
    expect(report.mergedShoppingItems).toBe(1)
    expect(report.issues).toEqual([])

    const repeatedReport = await migrateProductCatalogReferences(store)
    expect(repeatedReport.mergedShoppingItems).toBe(0)
    expect(repeatedReport.issues).toEqual([])
  })
})
