"use client"

import { openLocalDatabase } from "@/lib/storage/database"
import { gameBackupSchema, gameSchema, type PochaGame } from "@/schemas/game"

export class GameConflictError extends Error {
  constructor() {
    super("This game changed in another tab. Reload it before continuing.")
    this.name = "GameConflictError"
  }
}

export async function listGames() {
  const database = await openLocalDatabase()
  const records = await database.getAllFromIndex("games", "by-updated-at")
  return records.reverse().map((record) => gameSchema.parse(record))
}

export async function readGame(id: string) {
  const database = await openLocalDatabase()
  const record = await database.get("games", id)
  return record === undefined ? undefined : gameSchema.parse(record)
}

export async function createGame(game: PochaGame) {
  const valid = gameSchema.parse(game)
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  await transaction.store.add(valid)
  await transaction.done
  return valid
}

export async function saveGame(game: PochaGame, expectedRevision: number) {
  const valid = gameSchema.parse(game)
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  const current = await transaction.store.get(valid.id)
  if (!current || current.revision !== expectedRevision) {
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
  if (!current || current.revision !== expectedRevision) {
    await transaction.done
    throw new GameConflictError()
  }
  await transaction.store.delete(id)
  await transaction.done
}

export function exportGames(games: PochaGame[]) {
  return JSON.stringify(
    gameBackupSchema.parse({
      format: "pocha-score-backup",
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

export async function importGames(games: PochaGame[]) {
  const valid = games.map((game) => gameSchema.parse(game))
  const copies = valid.map((game) => ({
    ...game,
    id: crypto.randomUUID(),
    revision: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))
  const database = await openLocalDatabase()
  const transaction = database.transaction("games", "readwrite")
  try {
    await Promise.all(copies.map((game) => transaction.store.add(game)))
    await transaction.done
  } catch (error) {
    transaction.abort()
    throw error
  }
  return copies
}
