import "server-only"

import { describe, expect, it } from "bun:test"
import type { IndexSpec } from "./ensure-indexes"
import {
  ensureIndexes,
  INDEX_SPECS,
  type IndexDatabase,
  validateIndexSpecs,
} from "./ensure-indexes"

describe("MongoDB index specifications", () => {
  it("indexes pending request pagination by status and email", () => {
    expect(
      INDEX_SPECS.find((spec) => spec.options.name === "status_asc_email_asc")
    ).toEqual({
      collection: "user_access",
      keys: { status: 1, email: 1 },
      options: { name: "status_asc_email_asc" },
    })
  })
  it("the application index registry is valid", () => {
    expect(() => validateIndexSpecs(INDEX_SPECS)).not.toThrow()
  })

  it("registers unique normalized email access and supports email ordering", () => {
    expect(
      INDEX_SPECS.find((spec) => spec.options.name === "email_unique")
    ).toEqual({
      collection: "user_access",
      keys: { email: 1 },
      options: { name: "email_unique", unique: true },
    })
  })

  it("rejects duplicate names within a collection", () => {
    const specs: IndexSpec[] = [
      {
        collection: "items",
        keys: { createdAt: -1 },
        options: { name: "created_at_desc" },
      },
      {
        collection: "items",
        keys: { updatedAt: -1 },
        options: { name: "created_at_desc" },
      },
    ]

    expect(() => validateIndexSpecs(specs)).toThrow(
      "Duplicate MongoDB index name: items.created_at_desc"
    )
  })

  it("allows the same index name in different collections", () => {
    const specs: IndexSpec[] = [
      {
        collection: "items",
        keys: { createdAt: -1 },
        options: { name: "created_at_desc" },
      },
      {
        collection: "records",
        keys: { createdAt: -1 },
        options: { name: "created_at_desc" },
      },
    ]

    expect(() => validateIndexSpecs(specs)).not.toThrow()
  })

  it("creates every registered index with its options", async () => {
    const calls: Array<{ collection: string; name: string }> = []
    const database: IndexDatabase = {
      collection: (collection) => ({
        createIndex: async (_keys, options) => {
          calls.push({ collection, name: options?.name ?? "" })
          return options?.name ?? ""
        },
      }),
    }
    const specs: IndexSpec[] = [
      {
        collection: "items",
        keys: { createdAt: -1 },
        options: { name: "created_at_desc" },
      },
      {
        collection: "records",
        keys: { ownerId: 1, updatedAt: 1 },
        options: { name: "owner_id_asc_updated_at_asc" },
      },
    ]

    await ensureIndexes(database, specs)

    expect(calls).toEqual([
      { collection: "items", name: "created_at_desc" },
      { collection: "records", name: "owner_id_asc_updated_at_asc" },
    ])
  })
})
