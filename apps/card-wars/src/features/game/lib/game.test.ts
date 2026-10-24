import { expect, it } from "bun:test"
import {
  changeLives,
  createGame,
  finishGame,
  getGameDefaults,
  suggestStarterForNames,
  undoLastLifeChange,
} from "@/features/game/lib/game"
import { gameSchema } from "@/schemas/game"

function sampleGame(startedAt: string, winnerIndex = 0) {
  const game = createGame(["Finn", "Jake"], 0, startedAt)
  return finishGame(game, game.players[winnerIndex].id)
}

it("starts with 25 lives and stores the start as a UTC instant", () => {
  const game = createGame(["Finn", "Jake"], 1, "2026-10-24T09:00:00.000Z")
  expect(game.lives).toEqual([25, 25])
  expect(game.startedAt).toBe("2026-10-24T09:00:00.000Z")
  expect(game.startingPlayerId).toBe(game.players[1].id)
})

it("normalizes imported offsets to the same UTC start instant", () => {
  const game = createGame(["Finn", "Jake"], 0, "2026-10-24T09:00:00.000Z")
  expect(
    gameSchema.parse({ ...game, startedAt: "2026-10-24T11:00:00+02:00" })
      .startedAt
  ).toBe("2026-10-24T09:00:00.000Z")
})

it("preloads the last finished match and its winner, recognizing swapped names", () => {
  const previous = sampleGame("2026-10-23T09:00:00.000Z", 1)
  expect(getGameDefaults([previous])).toEqual({
    names: ["Finn", "Jake"],
    suggestedStarter: "Jake",
  })
  expect(suggestStarterForNames([previous], ["Jake", "Finn"])).toBe("Jake")
  expect(suggestStarterForNames([previous], ["Finn", "BMO"])).toBeNull()
})

it("uses the last created match when no finished match exists", () => {
  const first = createGame(["Finn", "Jake"], 0, "2026-10-22T09:00:00.000Z")
  const last = createGame(["BMO", "Marceline"], 1, "2026-10-23T09:00:00.000Z")
  expect(getGameDefaults([first, last])).toEqual({
    names: ["BMO", "Marceline"],
    suggestedStarter: null,
  })
})

it("changes lives, allows healing above 25, blocks negatives, and records undo", () => {
  const game = createGame(["Finn", "Jake"], 0)
  const healed = changeLives(game, game.players[0].id, 5)
  expect(healed.lives).toEqual([30, 25])
  const hurt = changeLives(healed, game.players[0].id, -5)
  expect(hurt.lives).toEqual([25, 25])
  const undone = undoLastLifeChange(hurt)
  expect(undone.lives).toEqual([30, 25])
  expect(undone.events.at(-1)?.type).toBe("undo")
  expect(() => changeLives(game, game.players[0].id, -26)).toThrow()
})

it("finishes with a selected winner or abandons without one", () => {
  const game = createGame(["Finn", "Jake"], 0)
  expect(finishGame(game, game.players[1].id).winnerId).toBe(game.players[1].id)
  const abandoned = finishGame(game, undefined)
  expect(abandoned.status).toBe("abandoned")
  expect(abandoned.winnerId).toBeUndefined()
})
