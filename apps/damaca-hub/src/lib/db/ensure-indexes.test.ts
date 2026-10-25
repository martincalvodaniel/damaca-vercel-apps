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
  it("indexes the catalog by its stable unique identifier", () => {
    expect(
      INDEX_SPECS.find((spec) => spec.options.name === "application_id_unique")
    ).toEqual({
      collection: "applications",
      keys: { id: 1 },
      options: { name: "application_id_unique", unique: true },
    })
  })
  it("the application index registry is valid", () => {
    expect(() => validateIndexSpecs(INDEX_SPECS)).not.toThrow()
  })

  it("enforces one access record per application and normalized email", () => {
    expect(
      INDEX_SPECS.find(
        (spec) => spec.options.name === "app_id_asc_email_asc_unique"
      )
    ).toEqual({
      collection: "app_access",
      keys: { appId: 1, email: 1 },
      options: { name: "app_id_asc_email_asc_unique", unique: true },
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

it("enforces unique identity and OAuth token lookup keys", () => {
  for (const collection of [
    "user",
    "session",
    "account",
    "oauthClient",
    "oauthAccessToken",
    "oauthRefreshToken",
  ]) {
    expect(
      INDEX_SPECS.some(
        (spec) => spec.collection === collection && spec.options.unique
      )
    ).toBe(true)
  }
  for (const collection of [
    "session",
    "verification",
    "oauthAccessToken",
    "oauthRefreshToken",
  ]) {
    expect(
      INDEX_SPECS.some(
        (spec) =>
          spec.collection === collection &&
          spec.options.expireAfterSeconds === 0
      )
    ).toBe(true)
  }
  expect(
    INDEX_SPECS.filter((spec) => spec.collection === "hub_oidc_clients").map(
      (spec) => spec.options.name
    )
  ).toEqual([
    "hub_oidc_app_environment_unique",
    "hub_oidc_client_id_unique",
    "hub_oidc_redirect_uri_unique",
  ])
})
