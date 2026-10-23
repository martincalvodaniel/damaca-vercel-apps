import type { Metadata } from "next"
import { toCatalogProductOption } from "@/features/catalog/product-option"
import { ShoppingListPage } from "@/features/shopping-list/components/shopping-list-page"
import { listInventoryItems } from "@/lib/db/inventory-items"
import { listShoppingListItems } from "@/lib/db/shopping-list-items"

export const metadata: Metadata = {
  title: "Lista de la compra — Dali",
  description: "Lista de la compra compartida de Dani y Pali.",
}

export default async function ShoppingListRoute() {
  const [items, inventoryItems] = await Promise.all([
    listShoppingListItems(),
    listInventoryItems(),
  ])

  return (
    <ShoppingListPage
      items={items}
      products={inventoryItems.map(toCatalogProductOption)}
    />
  )
}
