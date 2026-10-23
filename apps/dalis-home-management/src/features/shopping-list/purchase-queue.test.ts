import { describe, expect, test } from "bun:test"
import { PurchaseQueue } from "@/features/shopping-list/purchase-queue"

function createHarness() {
  type Result = { success: true } | { success: false; message: string }
  const requests: {
    id: string
    isPurchased: boolean
    resolve: (result: Result) => void
    reject: (error: Error) => void
  }[] = []
  let states = new Map<
    string,
    { isPurchased: boolean; isSaving: boolean; error: string | null }
  >()
  const queue = new PurchaseQueue(
    (id, isPurchased) =>
      new Promise<Result>((resolve, reject) => {
        requests.push({ id, isPurchased, resolve, reject })
      }),
    (next) => {
      states = next
    }
  )
  return { queue, requests, state: (id = "item") => states.get(id) }
}

const item = { id: "item", isPurchased: false }

describe("optimistic shopping-list purchases", () => {
  test("publishes the choice before scheduling the background save", async () => {
    const { queue, requests, state } = createHarness()
    let backgroundSave: () => Promise<void> = async () => {}
    await queue.toggle(item, (save) => {
      backgroundSave = save
      expect(state()).toMatchObject({ isPurchased: true, isSaving: true })
      expect(requests).toHaveLength(0)
    })
    const saving = backgroundSave()
    requests[0].resolve({ success: true })
    await saving
    expect(state()?.isSaving).toBe(false)
  })

  test("marks and unmarks immediately before either save completes", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    expect(state()).toMatchObject({ isPurchased: true, isSaving: true })

    await queue.toggle({ ...item, isPurchased: true })
    expect(state()).toMatchObject({ isPurchased: false, isSaving: true })
    expect(requests).toHaveLength(1)

    requests[0].resolve({ success: true })
    await Promise.resolve()
    expect(requests).toHaveLength(2)
    expect(requests[1].isPurchased).toBe(false)
    expect(state()?.isPurchased).toBe(false)
    requests[1].resolve({ success: true })
    await saving
    expect(state()).toMatchObject({ isPurchased: false, isSaving: false })
  })

  test("coalesces rapid clicks to the final desired state", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    await queue.toggle(item)
    await queue.toggle(item)
    expect(state()?.isPurchased).toBe(true)
    requests[0].resolve({ success: true })
    await saving
    expect(requests).toHaveLength(1)
    expect(state()?.isSaving).toBe(false)
  })

  test("rolls back a rejected save and exposes the server error", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    requests[0].resolve({ success: false, message: "Save failed" })
    await saving
    expect(state()).toMatchObject({
      isPurchased: false,
      isSaving: false,
      error: "Save failed",
    })
  })

  test("rolls back to the last confirmed save after a network failure", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    await queue.toggle(item)
    requests[0].resolve({ success: true })
    await Promise.resolve()
    requests[1].reject(new Error("Network failure"))
    await saving
    expect(state()).toMatchObject({ isPurchased: true, isSaving: false })
    expect(state()?.error).toBeTruthy()
  })

  test("does not roll back a newer choice when an earlier request fails", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    await queue.toggle(item)
    requests[0].reject(new Error("Network failure"))
    await saving
    expect(state()).toMatchObject({
      isPurchased: false,
      isSaving: false,
      error: null,
    })
  })

  test("preserves local changes across stale server refreshes", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    queue.reconcile([item])
    expect(state()?.isPurchased).toBe(true)
    requests[0].resolve({ success: true })
    await saving
    queue.reconcile([item])
    expect(state()?.isPurchased).toBe(true)
    queue.reconcile([{ ...item, isPurchased: true }])
    expect(state()).toBeUndefined()
  })

  test("keeps separate items responsive and saves both choices", async () => {
    const { queue, requests, state } = createHarness()
    const first = queue.toggle(item)
    const second = queue.toggle({ id: "other", isPurchased: true })
    expect(state()?.isPurchased).toBe(true)
    expect(state("other")?.isPurchased).toBe(false)
    requests[1].resolve({ success: true })
    requests[0].resolve({ success: true })
    await Promise.all([first, second])
    expect(state()?.isSaving).toBe(false)
    expect(state("other")?.isSaving).toBe(false)
  })

  test("discards deleted items without restoring them after a late save", async () => {
    const { queue, requests, state } = createHarness()
    const saving = queue.toggle(item)
    queue.reconcile([])
    requests[0].resolve({ success: true })
    await saving
    expect(state()).toBeUndefined()
  })
})
