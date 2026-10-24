import { expect, it } from "bun:test"
import {
  biddingOrder,
  createRound,
  createSchedule,
  gameTotals,
  leaders,
  scoreRound,
  validateBids,
  validateTricks,
} from "@/features/game/lib/rules"

it("creates the 28-round default schedule for four players", () => {
  const schedule = createSchedule(4, 10)
  expect(schedule).toHaveLength(28)
  expect(schedule.slice(0, 4)).toEqual([1, 1, 1, 1])
  expect(schedule.slice(12, 16)).toEqual([10, 10, 10, 10])
  expect(schedule.slice(-4)).toEqual([1, 1, 1, 1])
})

it("uses the expected maxima for three through six players", () => {
  expect(
    [3, 4, 5, 6].map(
      (count) =>
        createSchedule(count, 12).filter(
          (cards) => cards === Math.min(12, Math.floor(40 / count))
        ).length
    )
  ).toEqual([3, 4, 5, 6])
})

it("combines all one-card repetitions when the maximum is one", () => {
  expect(createSchedule(4, 1, 2, 3, 5)).toEqual(Array(10).fill(1))
})

it("scores exact bids and misses on either side", () => {
  expect(scoreRound(0, 0)).toBe(10)
  expect(scoreRound(3, 3)).toBe(25)
  expect(scoreRound(1, 3)).toBe(-10)
  expect(scoreRound(4, 2)).toBe(-10)
})

it("orders bids after the dealer and makes the dealer last", () => {
  expect(biddingOrder(2, 4)).toEqual([3, 0, 1, 2])
})

it("initializes bids and tricks at zero for every player", () => {
  const round = createRound(4, 1, 5)
  expect(round.bids).toEqual([0, 0, 0, 0, 0])
  expect(round.tricks).toEqual([0, 0, 0, 0, 0])
})

it("rejects bids that sum to the tricks and tricks with an incorrect total", () => {
  const round = createRound(3, 0, 3)
  round.bids = [1, 1, 1]
  expect(validateBids(round, 3)).toContain("cannot add up")
  round.bids = [0, 1, 1]
  expect(validateBids(round, 3)).toBeUndefined()
  round.tricks = [1, 2, 0]
  expect(validateTricks(round, 3)).toBeUndefined()
  round.tricks = [1, 1, 0]
  expect(validateTricks(round, 3)).toContain("must add up")
})

it("recalculates cumulative scores and reports every tied leader", () => {
  const round = createRound(1, 0, 3)
  round.bids = [0, 0, 0]
  round.tricks = [1, 0, 0]
  round.status = "complete"
  const players = ["Ada", "Bea", "Cris"].map((name) => ({
    id: name,
    name,
  }))
  const game = {
    id: "game",
    revision: 0,
    createdAt: "2026-10-24T00:00:00.000Z",
    updatedAt: "2026-10-24T00:00:00.000Z",
    players,
    schedule: [1],
    rounds: [round],
    status: "finished" as const,
    tieResolution: "shared" as const,
  }
  expect(gameTotals(game)).toEqual([-5, 10, 10])
  expect(leaders(game)).toEqual([1, 2])
})
