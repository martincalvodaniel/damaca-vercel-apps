import "fake-indexeddb/auto"
import { afterEach, expect, it } from "bun:test"
import { deleteDB } from "idb"
import { appConfig } from "@/config/app"
import { closeLocalDatabase, openLocalDatabase } from "@/lib/storage/database"
import {
  readThemePreference,
  writeThemePreference,
} from "@/lib/storage/preferences"

afterEach(async () => {
  await closeLocalDatabase()
  await deleteDB(appConfig.storageName)
})

it("creates storage lazily and preserves committed preferences after reopening", async () => {
  expect(await readThemePreference()).toBeUndefined()
  await writeThemePreference("dark")
  await closeLocalDatabase()
  expect(await readThemePreference()).toBe("dark")
  const database = await openLocalDatabase()
  expect(database.version).toBe(2)
  expect(database.objectStoreNames.contains("preferences")).toBe(true)
  expect(database.objectStoreNames.contains("games")).toBe(true)
})

it("rejects invalid input without replacing a valid stored preference", async () => {
  await writeThemePreference("light")
  await expect(writeThemePreference("invalid")).rejects.toThrow()
  expect(await readThemePreference()).toBe("light")
})

it("reports corrupt stored values instead of treating them as valid preferences", async () => {
  const database = await openLocalDatabase()
  await database.put("preferences", { theme: "dark" }, "theme")
  await expect(readThemePreference()).rejects.toThrow()
  await writeThemePreference("system")
  expect(await readThemePreference()).toBe("system")
})

it("reports unavailable storage and can retry when browser access is restored", async () => {
  const factory = globalThis.indexedDB
  Object.defineProperty(globalThis, "indexedDB", {
    value: undefined,
    configurable: true,
  })
  try {
    await expect(readThemePreference()).rejects.toThrow("unavailable")
  } finally {
    Object.defineProperty(globalThis, "indexedDB", {
      value: factory,
      configurable: true,
    })
  }
  await writeThemePreference("dark")
  expect(await readThemePreference()).toBe("dark")
})

it("closes the shared connection when another tab upgrades the database", async () => {
  await writeThemePreference("dark")
  const { openDB } = await import("idb")
  const upgraded = await openDB(appConfig.storageName, 3, {
    upgrade(database) {
      database.createObjectStore("future-records")
    },
  })
  try {
    expect(await upgraded.get("preferences", "theme")).toBe("dark")
    expect(upgraded.objectStoreNames.contains("future-records")).toBe(true)
    await expect(openLocalDatabase()).rejects.toThrow()
  } finally {
    upgraded.close()
  }
})
