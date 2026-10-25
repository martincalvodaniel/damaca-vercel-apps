"use client"

import { openLocalDatabase } from "@/lib/storage/database"
import { type CardWarsGame, gameBackupSchema, gameSchema } from "@/schemas/game"

export class GameConflictError extends Error {
  constructor() {
    super("Esta partida cambió en otra pestaña. Recárgala antes de continuar.")
    this.name = "GameConflictError"
  }
}

export async function listGames() {
  const database = await openLocalDatabase()
  const records = await database.getAllFromIndex("games", "by-started-at")
  return records
    .map((record) => gameSchema.parse(record))
    .sort((first, second) => second.startedAt.localeCompare(first.startedAt))
}

export async function readGame(id: string) {
  const database = await openLocalDatabase()
  const record = await database.get("games", id)
  return record === undefined ? undefined : gameSchema.parse(record)
}

export async function createGame(game: CardWarsGame) {
  const valid = gameSchema.parse(game)
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  await transaction.store.add(valid)
  await transaction.done
  return valid
}

export async function saveGame(game: CardWarsGame, expectedRevision: number) {
  const valid = gameSchema.parse(game)
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  const current = await transaction.store.get(valid.id)
  if (!current || gameSchema.parse(current).revision !== expectedRevision) {
    await transaction.done
    throw new GameConflictError()
  }
  const updated = gameSchema.parse({
    ...valid,
    revision: expectedRevision + 1,
    updatedAt: new Date().toISOString(),
  })
  await transaction.store.put(updated)
  await transaction.done
  return updated
}

export async function deleteGame(id: string, expectedRevision: number) {
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  const current = await transaction.store.get(id)
  if (!current || gameSchema.parse(current).revision !== expectedRevision) {
    await transaction.done
    throw new GameConflictError()
  }
  await transaction.store.delete(id)
  await transaction.done
}

export function exportGames(games: CardWarsGame[]) {
  return JSON.stringify(
    gameBackupSchema.parse({
      format: "card-wars-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      games,
    }),
    null,
    2
  )
}

export function parseGameBackup(contents: string) {
  return gameBackupSchema.parse(JSON.parse(contents))
}

export async function importGames(games: CardWarsGame[]) {
  const valid = games.map((game) => gameSchema.parse(game))
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  const added: CardWarsGame[] = []
  let duplicates = 0
  let conflicts = 0

  try {
    for (const game of valid) {
      const currentRecord = await transaction.store.get(game.id)
      if (!currentRecord) {
        await transaction.store.add(game)
        added.push(game)
        continue
      }
      const current = gameSchema.parse(currentRecord)
      if (JSON.stringify(current) === JSON.stringify(game)) duplicates += 1
      else conflicts += 1
    }
    await transaction.done
  } catch (error) {
    transaction.abort()
    throw error
  }
  return { added, duplicates, conflicts }
}
