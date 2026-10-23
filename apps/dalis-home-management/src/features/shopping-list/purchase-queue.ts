import { ItemUpdateQueue, type ItemUpdateResult } from "@/lib/item-update-queue"

interface PurchaseState {
  isPurchased: boolean
  isSaving: boolean
  error: string | null
}

type PurchaseItem = { id: string; isPurchased: boolean }

export class PurchaseQueue {
  private queue: ItemUpdateQueue<boolean>

  constructor(
    save: (id: string, isPurchased: boolean) => Promise<ItemUpdateResult>,
    onChange: (states: Map<string, PurchaseState>) => void
  ) {
    this.queue = new ItemUpdateQueue(
      save,
      (states) =>
        onChange(
          new Map(
            Array.from(states, ([id, state]) => [
              id,
              {
                isPurchased: state.value,
                isSaving: state.isSaving,
                error: state.error,
              },
            ])
          )
        ),
      "No se ha podido actualizar el producto."
    )
  }

  reconcile(items: PurchaseItem[]) {
    this.queue.reconcile(
      items.map((item) => ({ id: item.id, value: item.isPurchased }))
    )
  }

  toggle(item: PurchaseItem, schedule?: (save: () => Promise<void>) => void) {
    return this.queue.update(
      { id: item.id, value: item.isPurchased },
      (value) => !value,
      schedule
    )
  }
}
