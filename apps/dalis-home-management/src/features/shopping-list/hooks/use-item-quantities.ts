"use client"

import { setShoppingListItemQuantityAction } from "@/features/shopping-list/actions"
import { useOptimisticQuantities } from "@/hooks/use-optimistic-quantities"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"

export function useItemQuantities(items: ShoppingListItem[]) {
  return useOptimisticQuantities(
    items,
    setShoppingListItemQuantityAction,
    "No se ha podido actualizar la cantidad."
  )
}
