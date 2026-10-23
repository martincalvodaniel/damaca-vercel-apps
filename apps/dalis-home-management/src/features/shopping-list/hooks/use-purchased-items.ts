"use client"

import { startTransition, useEffect, useState } from "react"
import { setShoppingListItemPurchasedAction } from "@/features/shopping-list/actions"
import { PurchaseQueue } from "@/features/shopping-list/purchase-queue"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"

export function usePurchasedItems(items: ShoppingListItem[]) {
  const [states, setStates] = useState<
    Map<
      string,
      { isPurchased: boolean; isSaving: boolean; error: string | null }
    >
  >(() => new Map())
  const [queue] = useState(
    () => new PurchaseQueue(setShoppingListItemPurchasedAction, setStates)
  )

  useEffect(() => {
    if (states.size > 0) queue.reconcile(items)
  }, [items, queue, states])

  function togglePurchased(item: ShoppingListItem) {
    // Publish the optimistic state outside the transition so it renders urgently.
    void queue.toggle(item, startTransition)
  }

  return {
    items: items.map((item) => {
      const state = states.get(item.id)
      return state ? { ...item, isPurchased: state.isPurchased } : item
    }),
    states,
    togglePurchased,
  }
}
