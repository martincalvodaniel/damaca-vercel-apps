"use client"

import { startTransition, useEffect, useState } from "react"
import {
  ItemUpdateQueue,
  type ItemUpdateResult,
  type ItemUpdateState,
} from "@/lib/item-update-queue"

interface QuantityItem {
  id: string
  quantity: number
}

export function useOptimisticQuantities<Item extends QuantityItem>(
  items: Item[],
  save: (id: string, quantity: number) => Promise<ItemUpdateResult>,
  failureMessage: string
) {
  const [states, setStates] = useState<Map<string, ItemUpdateState<number>>>(
    () => new Map()
  )
  const [queue] = useState(
    () => new ItemUpdateQueue<number>(save, setStates, failureMessage)
  )

  useEffect(() => {
    if (states.size > 0) {
      queue.reconcile(
        items.map((item) => ({ id: item.id, value: item.quantity }))
      )
    }
  }, [items, queue, states])

  function updateQuantity(item: Item, quantity: number) {
    if (quantity === item.quantity) return
    // Keep the quantity responsive while Server Actions save inside a transition.
    void queue.update(
      { id: item.id, value: item.quantity },
      quantity,
      startTransition
    )
  }

  return {
    items: items.map((item) => {
      const state = states.get(item.id)
      return state ? { ...item, quantity: state.value } : item
    }),
    states,
    updateQuantity,
  }
}
