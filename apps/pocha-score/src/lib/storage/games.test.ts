import "fake-indexeddb/auto"
import { afterEach, expect, it } from "bun:test"
import { deleteDB } from "idb"
import { appConfig } from "@/config/app"
import { createRound } from "@/features/game/lib/rules"
import { closeLocalDatabase } from "@/lib/storage/database"
import {
  createGame,
  exportGames,
  GameConflictError,
  importGames,
  listGames,
  parseGameBackup,
  readGame,
  saveGame,
} from "@/lib/storage/games"
import type { PochaGame } from "@/schemas/game"

afterEach(async () => {
  await closeLocalDatabase()
  await deleteDB(appConfig.storageName)
})

function sampleGame(): PochaGame {
  const now = new Date().toISOString()
  const players = ["Ada", "Bea", "Cris"].map((name) => ({
    id: crypto.randomUUID(),
    name,
  }))
  const round = createRound(1, 0, players.length)
  return {
    id: crypto.randomUUID(),
    revision: 0,
    createdAt: now,
    updatedAt: now,
    players,
    schedule: [1],
    rounds: [round],
    status: "active",
    tieResolution: null,
  }
}

it("creates, lists, reopens and updates a game using increasing revisions", async () => {
  const game = sampleGame()
  await createGame(game)
  expect((await listGames()).map((item) => item.id)).toEqual([game.id])
  expect(await readGame(game.id)).toEqual(game)
  const saved = await saveGame(
    { ...game, rounds: [{ ...game.rounds[0], bids: [0, 0, 1] }] },
    0
  )
  expect(saved.revision).toBe(1)
  await expect(saveGame(game, 0)).rejects.toBeInstanceOf(GameConflictError)
})

it("exports valid JSON and imports every game as a new independent copy", async () => {
  const game = sampleGame()
  await createGame(game)
  const backup = parseGameBackup(exportGames([game]))
  const copies = await importGames(backup.games)
  expect(copies).toHaveLength(1)
  expect(copies[0].id).not.toBe(game.id)
  expect(await listGames()).toHaveLength(2)
})

it("rejects an invalid import before writing any copied games", async () => {
  const game = sampleGame()
  await createGame(game)
  expect(() => parseGameBackup('{"format":"unknown"}')).toThrow()
  await expect(
    importGames([{ ...game, rounds: [{ ...game.rounds[0], cards: 2 }] }])
  ).rejects.toThrow()
  expect(await listGames()).toHaveLength(1)
})
