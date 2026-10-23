"use client"

import { setInventoryItemQuantityAction } from "@/features/inventory/actions"
import { useOptimisticQuantities } from "@/hooks/use-optimistic-quantities"
import type { InventoryItem } from "@/schemas/inventory-item"

export function useInventoryQuantities(items: InventoryItem[]) {
  return useOptimisticQuantities(
    items,
    setInventoryItemQuantityAction,
    "No se ha podido actualizar la cantidad."
  )
}
