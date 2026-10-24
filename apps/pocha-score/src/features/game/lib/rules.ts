import type { PochaGame, PochaRound } from "@/schemas/game"

export const defaultMaximumByPlayers: Record<number, number> = {
  3: 12,
  4: 10,
  5: 8,
  6: 6,
}

export function createSchedule(
  playerCount: number,
  maximum: number,
  openingRepeats = playerCount,
  maximumRepeats = playerCount,
  closingRepeats = playerCount
) {
  const top = Math.min(maximum, defaultMaximumByPlayers[playerCount] ?? 0)
  if (top < 1) throw new Error("Choose between three and six players.")
  for (const repeats of [openingRepeats, maximumRepeats, closingRepeats]) {
    if (!Number.isInteger(repeats) || repeats < 1 || repeats > 20) {
      throw new Error("Round repetitions must be between one and twenty.")
    }
  }
  if (top === 1)
    return Array(openingRepeats + maximumRepeats + closingRepeats).fill(1)
  return [
    ...Array(openingRepeats).fill(1),
    ...Array.from({ length: Math.max(0, top - 2) }, (_, index) => index + 2),
    ...Array(maximumRepeats).fill(top),
    ...Array.from(
      { length: Math.max(0, top - 2) },
      (_, index) => top - index - 1
    ),
    ...Array(closingRepeats).fill(1),
  ]
}

export function createRound(
  cards: number,
  dealerIndex: number,
  playerCount: number
): PochaRound {
  return {
    id: crypto.randomUUID(),
    cards,
    dealerIndex,
    bids: Array(playerCount).fill(null),
    tricks: Array(playerCount).fill(null),
    status: "bidding",
  }
}

export function biddingOrder(dealerIndex: number, playerCount: number) {
  return Array.from(
    { length: playerCount },
    (_, index) => (dealerIndex + index + 1) % playerCount
  )
}

export function scoreRound(bid: number, tricks: number) {
  return bid === tricks ? 10 + 5 * tricks : -5 * Math.abs(bid - tricks)
}

export function roundScores(round: PochaRound, playerCount: number) {
  return Array.from({ length: playerCount }, (_, index) => {
    const bid = round.bids[index]
    const tricks = round.tricks[index]
    return round.status === "complete" && bid !== null && tricks !== null
      ? scoreRound(bid, tricks)
      : 0
  })
}

export function gameTotals(game: PochaGame) {
  return Array.from({ length: game.players.length }, (_, playerIndex) =>
    game.rounds.reduce(
      (total, round) =>
        total + roundScores(round, game.players.length)[playerIndex],
      0
    )
  )
}

export function leaders(game: PochaGame) {
  const totals = gameTotals(game)
  const highest = Math.max(...totals)
  return totals.flatMap((score, index) => (score === highest ? [index] : []))
}

export function validateBids(round: PochaRound, playerCount: number) {
  if (
    round.bids.length !== playerCount ||
    round.bids.some((bid) => bid === null)
  ) {
    return "Enter a bid for every player."
  }
  const total = round.bids.reduce<number>((sum, bid) => sum + (bid ?? 0), 0)
  if (total === round.cards)
    return "The bids cannot add up to the tricks in this round."
  return undefined
}

export function validateTricks(round: PochaRound, playerCount: number) {
  if (
    round.tricks.length !== playerCount ||
    round.tricks.some((tricks) => tricks === null)
  ) {
    return "Enter tricks for every player."
  }
  if (
    round.tricks.reduce<number>((sum, tricks) => sum + (tricks ?? 0), 0) !==
    round.cards
  ) {
    return `Tricks must add up to ${round.cards}.`
  }
  return undefined
}

export function isGameComplete(game: PochaGame) {
  return (
    game.rounds.length >= game.schedule.length &&
    game.rounds.every((round) => round.status === "complete")
  )
}
