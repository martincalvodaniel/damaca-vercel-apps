import { expect, test as it } from "bun:test"
import { childrenOf, moveItem, removalGroup, removalSnapshot } from "./list"

const bread = { id: "a", name: "Bread", checked: true }
const milk = { id: "b", name: "Milk", checked: false }
const eggs = { id: "c", name: "Eggs", checked: true }
const list = [bread, milk, eggs]

it("moves items in either direction without grouping checked items", () => {
  expect(moveItem(list, "a", { id: "c", placement: "after" })).toEqual([
    milk,
    eggs,
    bread,
  ])
  expect(moveItem(list, "c", { id: "a", placement: "before" })).toEqual([
    eggs,
    bread,
    milk,
  ])
  expect(moveItem(list, "a", { id: "missing", placement: "after" })).toBeNull()
})

it("nests one level, keeps sibling order, and moves parents with their children", () => {
  const first = moveItem(list, "b", { id: "a", placement: "inside" }) ?? []
  const second = moveItem(first, "c", { id: "a", placement: "inside" }) ?? []
  expect(
    childrenOf(second, "a").map(({ id, checked }) => [id, checked])
  ).toEqual([
    ["b", false],
    ["c", true],
  ])
  expect(moveItem(second, "a", { id: "b", placement: "before" })).toBeNull()
  expect(moveItem(second, "c", { id: "b", placement: "inside" })).toBeNull()
  const lifted = moveItem(second, "c", { id: "a", placement: "before" }) ?? []
  expect(lifted[0]).toEqual(eggs)
  expect(moveItem(lifted, "a", { id: "c", placement: "inside" })).toBeNull()
  const moved = moveItem(lifted, "a", { id: "c", placement: "before" }) ?? []
  expect(moved.filter(({ parentId }) => !parentId)).toEqual([bread, eggs])
  expect(childrenOf(moved, "a")).toEqual([{ ...milk, parentId: "a" }])
})

it("invalidates confirmation when the products to be removed change", () => {
  const nested = moveItem(list, "b", { id: "a", placement: "inside" }) ?? []
  const originals = removalGroup(nested, bread)
  expect(originals.map(({ id }) => id)).toEqual(["a", "b"])
  expect(removalSnapshot(originals)).not.toBe(
    removalSnapshot(removalGroup(list, bread))
  )
  expect(removalSnapshot(originals)).not.toBe(
    removalSnapshot([bread, { ...milk, name: "Oat milk" }])
  )
  expect(removalSnapshot(originals)).toBe(
    removalSnapshot([bread, { ...milk, checked: true }])
  )
})
