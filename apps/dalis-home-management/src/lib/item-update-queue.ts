export type ItemUpdateResult =
  | { success: true }
  | { success: false; message: string }

export interface ItemUpdateState<Value> {
  value: Value
  isSaving: boolean
  error: string | null
}

interface ItemUpdateEntry<Value> extends ItemUpdateState<Value> {
  confirmed: Value
  revision: number
}

type UpdateItem<Value> = { id: string; value: Value }

export class ItemUpdateQueue<Value> {
  private entries = new Map<string, ItemUpdateEntry<Value>>()

  constructor(
    private save: (id: string, value: Value) => Promise<ItemUpdateResult>,
    private onChange: (states: Map<string, ItemUpdateState<Value>>) => void,
    private failureMessage: string
  ) {}

  private publish() {
    this.onChange(
      new Map(Array.from(this.entries, ([id, entry]) => [id, { ...entry }]))
    )
  }

  reconcile(items: UpdateItem<Value>[]) {
    const itemsById = new Map(items.map((item) => [item.id, item]))
    let changed = false
    for (const [id, entry] of this.entries) {
      const item = itemsById.get(id)
      if (
        !item ||
        (!entry.isSaving && !entry.error && item.value === entry.value)
      ) {
        this.entries.delete(id)
        changed = true
      }
    }
    if (changed) this.publish()
  }

  async update(
    item: UpdateItem<Value>,
    nextValue: Value | ((value: Value) => Value),
    schedule?: (save: () => Promise<void>) => void
  ): Promise<void> {
    const entry = this.entries.get(item.id) ?? {
      value: item.value,
      confirmed: item.value,
      isSaving: false,
      error: null,
      revision: 0,
    }
    entry.value =
      typeof nextValue === "function"
        ? (nextValue as (value: Value) => Value)(entry.value)
        : nextValue
    entry.error = null
    entry.revision += 1
    this.entries.set(item.id, entry)

    if (entry.isSaving) {
      this.publish()
      return
    }

    entry.isSaving = true
    this.publish()

    if (schedule) {
      schedule(() => this.persist(item.id, entry))
    } else {
      await this.persist(item.id, entry)
    }
  }

  private async persist(
    id: string,
    entry: ItemUpdateEntry<Value>
  ): Promise<void> {
    // Serialize writes per item while keeping the latest click visible immediately.
    while (this.entries.get(id) === entry) {
      const requested = entry.value
      const revision = entry.revision
      let error: string | null = null
      try {
        const result = await this.save(id, requested)
        if (result.success) entry.confirmed = requested
        else error = result.message
      } catch {
        error = this.failureMessage
      }

      if (this.entries.get(id) !== entry) return
      if (error && revision === entry.revision) {
        entry.value = entry.confirmed
        entry.error = error
      } else if (entry.value !== entry.confirmed) {
        continue
      }

      entry.isSaving = false
      this.publish()
      return
    }
  }
}
