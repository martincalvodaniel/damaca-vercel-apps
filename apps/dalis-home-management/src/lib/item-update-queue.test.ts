import { describe, expect, test } from "bun:test"
import {
  ItemUpdateQueue,
  type ItemUpdateResult,
  type ItemUpdateState,
} from "@/lib/item-update-queue"

function createHarness() {
  const requests: {
    id: string
    quantity: number
    resolve: (result: ItemUpdateResult) => void
    reject: (error: Error) => void
  }[] = []
  let states = new Map<string, ItemUpdateState<number>>()
  const queue = new ItemUpdateQueue<number>(
    (id, quantity) =>
      new Promise((resolve, reject) => {
        requests.push({ id, quantity, resolve, reject })
      }),
    (next) => {
      states = next
    },
    "Quantity save failed"
  )
  return { queue, requests, state: (id = "item") => states.get(id) }
}

const item = { id: "item", value: 2 }

describe("optimistic item quantities", () => {
  test("reaches zero immediately and can restock while the save is pending", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update({ id: "item", value: 1 }, 0)
    expect(state()).toMatchObject({ value: 0, isSaving: true })
    await queue.update({ id: "item", value: 0 }, 1)
    expect(state()?.value).toBe(1)
    requests[0].resolve({ success: true })
    await Promise.resolve()
    expect(requests[1].quantity).toBe(1)
    requests[1].resolve({ success: true })
    await saving
    expect(state()).toMatchObject({ value: 1, isSaving: false, error: null })
  })

  test("restores in-stock quantity when saving zero fails", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 0)
    requests[0].reject(new Error("Network failure"))
    await saving
    expect(state()).toMatchObject({
      value: 2,
      isSaving: false,
      error: "Quantity save failed",
    })
  })

  test("restores zero stock when an increment from zero fails", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update({ id: "item", value: 0 }, 1)
    expect(state()?.value).toBe(1)
    requests[0].resolve({ success: false, message: "Save failed" })
    await saving
    expect(state()).toMatchObject({
      value: 0,
      isSaving: false,
      error: "Save failed",
    })
  })

  test("shows increments and decrements immediately and saves the final quantity", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 3)
    expect(state()).toMatchObject({ value: 3, isSaving: true })
    await queue.update(item, 4)
    expect(state()?.value).toBe(4)
    await queue.update(item, 3)
    await queue.update(item, 2)
    expect(state()?.value).toBe(2)
    expect(requests).toHaveLength(1)
    requests[0].resolve({ success: true })
    await Promise.resolve()
    expect(requests).toHaveLength(2)
    expect(requests[1].quantity).toBe(2)
    expect(state()?.value).toBe(2)
    requests[1].resolve({ success: true })
    await saving
    expect(state()).toMatchObject({ value: 2, isSaving: false, error: null })
  })

  test("supports decimal quantities without replacing them with stale server data", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update({ id: "item", value: 0.3 }, 0.4)
    await queue.update({ id: "item", value: 0.4 }, 0.5)
    queue.reconcile([{ id: "item", value: 0.3 }])
    expect(state()?.value).toBe(0.5)
    requests[0].resolve({ success: true })
    await Promise.resolve()
    queue.reconcile([{ id: "item", value: 0.4 }])
    expect(state()?.value).toBe(0.5)
    requests[1].resolve({ success: true })
    await saving
    queue.reconcile([{ id: "item", value: 0.4 }])
    expect(state()?.value).toBe(0.5)
    queue.reconcile([{ id: "item", value: 0.5 }])
    expect(state()).toBeUndefined()
  })

  test("restores the confirmed quantity and exposes a validation failure", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 3)
    requests[0].resolve({ success: false, message: "Invalid quantity" })
    await saving
    expect(state()).toMatchObject({
      value: 2,
      isSaving: false,
      error: "Invalid quantity",
    })
  })

  test("restores the last successful quantity after a later network failure", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 3)
    await queue.update(item, 4)
    requests[0].resolve({ success: true })
    await Promise.resolve()
    requests[1].reject(new Error("Network failure"))
    await saving
    expect(state()).toMatchObject({
      value: 3,
      isSaving: false,
      error: "Quantity save failed",
    })

    const retry = queue.update(item, 4)
    expect(state()).toMatchObject({ value: 4, isSaving: true, error: null })
    requests[2].resolve({ success: true })
    await retry
    expect(state()).toMatchObject({ value: 4, isSaving: false, error: null })
  })

  test("keeps a newer quantity when an older request fails", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 3)
    await queue.update(item, 5)
    requests[0].reject(new Error("Network failure"))
    await Promise.resolve()
    expect(state()).toMatchObject({ value: 5, isSaving: true, error: null })
    expect(requests[1].quantity).toBe(5)
    requests[1].resolve({ success: true })
    await saving
    expect(state()).toMatchObject({ value: 5, isSaving: false, error: null })
  })

  test("preserves a pending quantity when the purchased state moves the row", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.update(item, 3)
    const purchasedItem = { ...item, isPurchased: true }
    queue.reconcile([purchasedItem])
    expect(state()).toMatchObject({ value: 3, isSaving: true })
    requests[0].resolve({ success: true })
    await saving
    expect(state()?.value).toBe(3)
  })

  test("publishes the quantity before scheduling the save", async () => {
    const { queue, requests, state } = createHarness()
    let backgroundSave: () => Promise<void> = async () => {}
    await queue.update(item, 3, (save) => {
      backgroundSave = save
      expect(state()).toMatchObject({ value: 3, isSaving: true })
      expect(requests).toHaveLength(0)
    })
    const saving = backgroundSave()
    requests[0].resolve({ success: true })
    await saving
    expect(state()?.isSaving).toBe(false)
  })
})
