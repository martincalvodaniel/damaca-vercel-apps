import { type CardWarsGame, gameSchema } from "@/schemas/game"

export type GameDefaults = {
  names: [string, string]
  suggestedStarter: string | null
}

export function normalizePlayerName(name: string) {
  return name.trim().toLocaleLowerCase("es")
}

export function getGameDefaults(games: CardWarsGame[]): GameDefaults {
  const finished = games
    .filter((game) => game.status === "finished")
    .sort((first, second) =>
      (second.endedAt ?? second.updatedAt).localeCompare(
        first.endedAt ?? first.updatedAt
      )
    )[0]
  const reference =
    finished ??
    [...games].sort((first, second) =>
      second.createdAt.localeCompare(first.createdAt)
    )[0]
  if (!reference) return { names: ["", ""], suggestedStarter: null }
  return {
    names: [reference.players[0].name, reference.players[1].name],
    suggestedStarter:
      finished?.players.find((player) => player.id === finished.winnerId)
        ?.name ?? null,
  }
}

export function suggestStarterForNames(
  games: CardWarsGame[],
  names: [string, string]
) {
  if (!names[0].trim() || !names[1].trim()) return null
  const normalizedNames = new Set(names.map(normalizePlayerName))
  if (normalizedNames.size !== 2) return null
  const previous = games
    .filter((game) => game.status === "finished")
    .sort((first, second) =>
      (second.endedAt ?? second.updatedAt).localeCompare(
        first.endedAt ?? first.updatedAt
      )
    )
    .find(
      (game) =>
        new Set(game.players.map((player) => normalizePlayerName(player.name)))
          .size === 2 &&
        game.players.every((player) =>
          normalizedNames.has(normalizePlayerName(player.name))
        )
    )
  return (
    previous?.players.find((player) => player.id === previous.winnerId)?.name ??
    null
  )
}

export function createGame(
  names: [string, string],
  starterIndex: 0 | 1,
  now = new Date().toISOString()
): CardWarsGame {
  const players = names.map((name) => ({
    id: crypto.randomUUID(),
    name: name.trim(),
  }))
  return gameSchema.parse({
    id: crypto.randomUUID(),
    revision: 0,
    createdAt: now,
    startedAt: now,
    updatedAt: now,
    players,
    lives: [25, 25],
    startingPlayerId: players[starterIndex].id,
    status: "active",
    events: [],
  })
}

export function changeLives(
  game: CardWarsGame,
  playerId: string,
  delta: number
) {
  if (game.status !== "active") throw new Error("La partida ya ha terminado.")
  if (!Number.isInteger(delta) || delta === 0) {
    throw new Error("El cambio de vidas no es válido.")
  }
  const playerIndex = game.players.findIndex((player) => player.id === playerId)
  if (playerIndex < 0)
    throw new Error("El jugador no pertenece a esta partida.")
  const before = game.lives[playerIndex]
  const after = before + delta
  if (after < 0) throw new Error("Las vidas no pueden ser negativas.")
  const event = {
    id: crypto.randomUUID(),
    type: "change" as const,
    playerId,
    before,
    after,
    createdAt: new Date().toISOString(),
  }
  return gameSchema.parse({
    ...game,
    lives: game.lives.map((lives, index) =>
      index === playerIndex ? after : lives
    ),
    events: [...game.events, event],
  })
}

export function undoLastLifeChange(game: CardWarsGame) {
  if (game.status !== "active") throw new Error("La partida ya ha terminado.")
  const undoneIds = new Set(
    game.events.flatMap((event) =>
      event.type === "undo" ? [event.targetId] : []
    )
  )
  const target = [...game.events]
    .reverse()
    .find((event) => event.type === "change" && !undoneIds.has(event.id))
  if (target?.type !== "change") return game
  const playerIndex = game.players.findIndex(
    (player) => player.id === target.playerId
  )
  if (playerIndex < 0) return game
  const before = game.lives[playerIndex]
  const after = target.before
  const undo = {
    id: crypto.randomUUID(),
    type: "undo" as const,
    targetId: target.id,
    playerId: target.playerId,
    before,
    after,
    createdAt: new Date().toISOString(),
  }
  return gameSchema.parse({
    ...game,
    lives: game.lives.map((lives, index) =>
      index === playerIndex ? after : lives
    ),
    events: [...game.events, undo],
  })
}

export function finishGame(game: CardWarsGame, winnerId: string | undefined) {
  if (game.status !== "active") throw new Error("La partida ya ha terminado.")
  if (winnerId && !game.players.some((player) => player.id === winnerId)) {
    throw new Error("El ganador debe ser uno de los jugadores.")
  }
  const endedAt = new Date().toISOString()
  return gameSchema.parse({
    ...game,
    status: winnerId ? "finished" : "abandoned",
    ...(winnerId ? { winnerId } : {}),
    endedAt,
  })
}
