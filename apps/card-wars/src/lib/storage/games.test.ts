import "fake-indexeddb/auto"
import { afterEach, expect, it } from "bun:test"
import { deleteDB, openDB } from "idb"
import { appConfig } from "@/config/app"
import { createGame } from "@/features/game/lib/game"
import { closeLocalDatabase, openLocalDatabase } from "@/lib/storage/database"
import {
  deleteGame,
  exportGames,
  GameConflictError,
  importGames,
  listGames,
  parseGameBackup,
  readGame,
  saveGame,
  createGame as saveNewGame,
} from "@/lib/storage/games"

afterEach(async () => {
  await closeLocalDatabase()
  await deleteDB(appConfig.storageName)
})

it("migrates the preferences store to version 2 without losing its value", async () => {
  const oldDatabase = await openDB(appConfig.storageName, 1, {
    upgrade(database) {
      database.createObjectStore("preferences")
    },
  })
  await oldDatabase.put("preferences", "dark", "theme")
  oldDatabase.close()

  const database = await openLocalDatabase()
  expect(database.version).toBe(2)
  expect(await database.get("preferences", "theme")).toBe("dark")
  expect(database.objectStoreNames.contains("games")).toBe(true)
})

it("creates, lists, reads, and saves games with optimistic revisions", async () => {
  const game = createGame(["Finn", "Jake"], 0)
  await saveNewGame(game)
  expect((await listGames()).map((entry) => entry.id)).toEqual([game.id])
  expect(await readGame(game.id)).toEqual(game)
  const saved = await saveGame({ ...game, lives: [24, 25] }, 0)
  expect(saved.revision).toBe(1)
  await expect(saveGame(game, 0)).rejects.toBeInstanceOf(GameConflictError)
})

it("round trips backups and merges without overwriting conflicts", async () => {
  const local = createGame(["Finn", "Jake"], 0, "2026-10-24T08:00:00.000Z")
  const imported = createGame(
    ["BMO", "Marceline"],
    1,
    "2026-10-23T08:00:00.000Z"
  )
  await saveNewGame(local)
  const backup = parseGameBackup(exportGames([local, imported]))
  expect(backup.games[0].startedAt).toBe("2026-10-24T08:00:00.000Z")
  const conflict = { ...local, lives: [24, 25] as [number, number] }
  const result = await importGames([...backup.games, conflict])
  expect(result.added.map((game) => game.id)).toEqual([imported.id])
  expect(result.duplicates).toBe(1)
  expect(result.conflicts).toBe(1)
  expect((await readGame(local.id))?.lives).toEqual([25, 25])
  expect((await listGames()).map((game) => game.id)).toContain(imported.id)
})

it("rejects malformed backups without changing local games", async () => {
  const game = createGame(["Finn", "Jake"], 0)
  await saveNewGame(game)
  expect(() => parseGameBackup('{"format":"unknown"}')).toThrow()
  const backup = JSON.parse(exportGames([game])) as { games: unknown[] }
  backup.games.push({ id: "broken" })
  await expect(importGames(backup.games as never[])).rejects.toThrow()
  expect(await listGames()).toHaveLength(1)
})

it("deletes a game only when its revision still matches", async () => {
  const game = createGame(["Finn", "Jake"], 0)
  await saveNewGame(game)
  await expect(deleteGame(game.id, 1)).rejects.toBeInstanceOf(GameConflictError)
  expect(await readGame(game.id)).toEqual(game)
  await deleteGame(game.id, game.revision)
  expect(await readGame(game.id)).toBeUndefined()
  expect(await listGames()).toEqual([])
  expect(parseGameBackup(exportGames(await listGames())).games).toEqual([])
})
