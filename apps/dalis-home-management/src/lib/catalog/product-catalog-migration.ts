import { normalizeProductName } from "@/lib/catalog/product-name"
import type { QuantityUnit } from "@/schemas/quantity-unit"

export interface MigrationProduct {
  id: string
  name: string
  unit: QuantityUnit
  normalizedName?: string
}

interface LegacyReference {
  id: string
  name: string
  unit: QuantityUnit
}

export interface LegacyShoppingReference extends LegacyReference {
  quantity: number
  isPurchased: boolean
  isMealPlanGenerated: boolean
}

export interface LegacyIngredientReference extends LegacyReference {
  dishId: string
}

export interface ProductCatalogMigrationStore {
  listProducts(): Promise<MigrationProduct[]>
  setProductNormalizedName(id: string, normalizedName: string): Promise<void>
  createProduct(name: string, unit: QuantityUnit): Promise<MigrationProduct>
  listLegacyIngredients(): Promise<LegacyIngredientReference[]>
  linkIngredient(
    reference: LegacyIngredientReference,
    product: MigrationProduct
  ): Promise<boolean>
  listLegacyShoppingItems(): Promise<LegacyShoppingReference[]>
  hasLinkedShoppingItem(itemId: string, productId: string): Promise<boolean>
  mergeShoppingItemCollision(
    reference: LegacyShoppingReference,
    product: MigrationProduct
  ): Promise<"merged" | "concurrent-change">
  linkShoppingItem(
    reference: LegacyShoppingReference,
    product: MigrationProduct
  ): Promise<boolean>
}

interface ProductCatalogMigrationIssue {
  kind: "ingredient" | "shopping-list"
  referenceId: string
  name: string
  unit: QuantityUnit
  reason: "ambiguous-product" | "concurrent-change"
}

export interface ProductCatalogMigrationReport {
  normalizedProducts: number
  createdProducts: number
  linkedIngredients: number
  linkedShoppingItems: number
  mergedShoppingItems: number
  issues: ProductCatalogMigrationIssue[]
}

function productKey(name: string, unit: QuantityUnit): string {
  return `${normalizeProductName(name)}:${unit}`
}

function addProductToLookup(
  lookup: Map<string, MigrationProduct[]>,
  product: MigrationProduct
): void {
  const key = productKey(product.name, product.unit)
  lookup.set(key, [...(lookup.get(key) ?? []), product])
}

async function resolveProduct(
  reference: LegacyReference,
  lookup: Map<string, MigrationProduct[]>,
  store: ProductCatalogMigrationStore
): Promise<MigrationProduct | "ambiguous"> {
  const key = productKey(reference.name, reference.unit)
  const candidates = lookup.get(key) ?? []

  if (candidates.length > 1) {
    return "ambiguous"
  }
  if (candidates[0]) {
    return candidates[0]
  }

  const product = await store.createProduct(
    reference.name.trim(),
    reference.unit
  )
  addProductToLookup(lookup, product)
  return product
}

export async function migrateProductCatalogReferences(
  store: ProductCatalogMigrationStore
): Promise<ProductCatalogMigrationReport> {
  const report: ProductCatalogMigrationReport = {
    normalizedProducts: 0,
    createdProducts: 0,
    linkedIngredients: 0,
    linkedShoppingItems: 0,
    mergedShoppingItems: 0,
    issues: [],
  }
  const products = await store.listProducts()
  const productsByKey = new Map<string, MigrationProduct[]>()

  for (const product of products) {
    const normalizedName = normalizeProductName(product.name)
    if (product.normalizedName !== normalizedName) {
      await store.setProductNormalizedName(product.id, normalizedName)
      report.normalizedProducts += 1
    }
    addProductToLookup(productsByKey, { ...product, normalizedName })
  }

  const legacyIngredients = await store.listLegacyIngredients()
  for (const reference of legacyIngredients) {
    const productCountBefore = productsByKey.size
    const product = await resolveProduct(reference, productsByKey, store)
    if (product === "ambiguous") {
      report.issues.push({
        kind: "ingredient",
        referenceId: reference.id,
        name: reference.name,
        unit: reference.unit,
        reason: "ambiguous-product",
      })
      continue
    }
    if (productsByKey.size > productCountBefore) {
      report.createdProducts += 1
    }

    if (await store.linkIngredient(reference, product)) {
      report.linkedIngredients += 1
    } else {
      report.issues.push({
        kind: "ingredient",
        referenceId: reference.id,
        name: reference.name,
        unit: reference.unit,
        reason: "concurrent-change",
      })
    }
  }

  const legacyShoppingItems = await store.listLegacyShoppingItems()
  for (const reference of legacyShoppingItems) {
    const productCountBefore = productsByKey.size
    const product = await resolveProduct(reference, productsByKey, store)
    if (product === "ambiguous") {
      report.issues.push({
        kind: "shopping-list",
        referenceId: reference.id,
        name: reference.name,
        unit: reference.unit,
        reason: "ambiguous-product",
      })
      continue
    }
    if (productsByKey.size > productCountBefore) {
      report.createdProducts += 1
    }

    if (await store.hasLinkedShoppingItem(reference.id, product.id)) {
      const mergeResult = await store.mergeShoppingItemCollision(
        reference,
        product
      )
      if (mergeResult === "merged") {
        report.mergedShoppingItems += 1
      } else {
        report.issues.push({
          kind: "shopping-list",
          referenceId: reference.id,
          name: reference.name,
          unit: reference.unit,
          reason: "concurrent-change",
        })
      }
      continue
    }

    if (await store.linkShoppingItem(reference, product)) {
      report.linkedShoppingItems += 1
    } else {
      report.issues.push({
        kind: "shopping-list",
        referenceId: reference.id,
        name: reference.name,
        unit: reference.unit,
        reason: "concurrent-change",
      })
    }
  }

  return report
}
