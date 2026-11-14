import { expect, test as it } from "bun:test"
import { moveItem } from "./list"

it("moves items in either direction without grouping checked items", () => {
  const items = [
    { id: "a", name: "Bread", checked: true },
    { id: "b", name: "Milk", checked: false },
    { id: "c", name: "Eggs", checked: true },
  ]
  expect(moveItem(items, "a", "c")).toEqual([items[1], items[2], items[0]])
  expect(moveItem(items, "c", "a")).toEqual([items[2], items[0], items[1]])
  expect(moveItem(items, "a", "missing")).toBe(items)
})
