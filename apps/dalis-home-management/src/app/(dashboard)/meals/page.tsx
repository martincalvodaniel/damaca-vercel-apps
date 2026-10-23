import type { Metadata } from "next"
import { toCatalogProductOption } from "@/features/catalog/product-option"
import { DishCatalogPage } from "@/features/meal-planning/components/dish-catalog-page"
import { listDishes } from "@/lib/db/dishes"
import { listInventoryItems } from "@/lib/db/inventory-items"

export const metadata: Metadata = {
  title: "Nuestros platos — Dali",
  description:
    "Platos e ingredientes reutilizables para el menú de Dani y Pali.",
}

export default async function MealsRoute() {
  const [dishes, inventoryItems] = await Promise.all([
    listDishes(),
    listInventoryItems(),
  ])
  const products = inventoryItems.map(toCatalogProductOption)

  return <DishCatalogPage dishes={dishes} products={products} />
}
