import type { Metadata } from "next"
import { InventoryPage } from "@/features/inventory/components/inventory-page"
import { listInventoryItems } from "@/lib/db/inventory-items"

export const metadata: Metadata = {
  title: "Inventario — Dali",
  description: "Inventario compartido del hogar de Dani y Pali.",
}

export default async function InventoryRoute() {
  const items = await listInventoryItems()

  return <InventoryPage items={items} />
}
