import { expect, test as it } from "bun:test"
import { changeTopic, topicCatalog } from "./catalog"

it("historical names resolve to stable IDs for the owner", () => {
  const legacy = topicCatalog(
    "owner",
    [],
    ["Software Engineering", " software  ENGINEERING "]
  )
  const entry = legacy.find("SOFTWARE ENGINEERING")
  expect(legacy.entries).toHaveLength(1)
  expect(entry?.id).toBe(
    topicCatalog("owner", [], ["software engineering"]).entries[0].id
  )
  expect(entry?.id).not.toBe(
    topicCatalog("another owner", [], ["Software Engineering"]).entries[0].id
  )
})

it("rename preserves the original name and disallows collisions with another topic", () => {
  const owner = "owner"
  const { entries, find } = topicCatalog(owner, [], ["AI", "Programming"])
  const ai = find("AI")
  if (!ai) throw new Error("Fixture topic missing")
  expect(
    changeTopic(owner, entries, {
      operation: "alias",
      topicId: ai.id,
      label: "programming",
    })
  ).toBeNull()
  const renamed = changeTopic(owner, entries, {
    operation: "rename",
    topicId: ai.id,
    label: "Artificial Intelligence",
  })
  if (!renamed) throw new Error("Rename failed")
  const catalog = topicCatalog(owner, renamed, ["AI"])
  expect(catalog.find("AI")?.id).toBe(ai.id)
  expect(catalog.find("artificial intelligence")?.label).toBe(
    "Artificial Intelligence"
  )
})

it("merged IDs and aliases follow a series of merges", () => {
  const owner = "owner"
  const catalog = topicCatalog(owner, [], ["AI", "ML", "Engineering"])
  const ai = catalog.find("AI")
  const ml = catalog.find("ML")
  const engineering = catalog.find("Engineering")
  if (!ai || !ml || !engineering) throw new Error("Fixture topic missing")
  const first = changeTopic(owner, catalog.entries, {
    operation: "merge",
    topicId: ai.id,
    targetId: ml.id,
  })
  if (!first) throw new Error("Merge failed")
  expect(
    changeTopic(owner, first, {
      operation: "merge",
      topicId: ml.id,
      targetId: ai.id,
    })
  ).toBeNull()
  const second = changeTopic(owner, first, {
    operation: "merge",
    topicId: ml.id,
    targetId: engineering.id,
  })
  if (!second) throw new Error("Merge failed")
  const merged = topicCatalog(owner, second, ["AI", "ML"])
  expect(merged.resolve(ai.id)?.id).toBe(engineering.id)
  expect(merged.find("ML")?.id).toBe(engineering.id)
})
