import { describe, expect, it } from "bun:test"
import type { IndexDescription } from "mongodb"
import { sameIndexes } from "./index.js"

describe("database refresh index manifests", () => {
  const sourceIndex = {
    name: "email_unique",
    key: { email: 1 },
    unique: true,
    ns: "production.user",
    v: 2,
  } as IndexDescription

  it("ignores MongoDB-generated namespace and version metadata", () => {
    const targetIndex = {
      name: "email_unique",
      key: { email: 1 },
      unique: true,
      ns: "integration.user",
      v: 3,
      background: true,
    } as IndexDescription

    expect(sameIndexes([sourceIndex], [targetIndex])).toBe(true)
  })

  it("detects differences in index names and options", () => {
    const renamed = { ...sourceIndex, name: "email_index" }
    const nonUnique = { ...sourceIndex, unique: false }

    expect(sameIndexes([sourceIndex], [renamed])).toBe(false)
    expect(sameIndexes([sourceIndex], [nonUnique])).toBe(false)
  })
})
