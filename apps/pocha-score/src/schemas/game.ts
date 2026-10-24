import { z } from "zod"

export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(32),
})

export const roundSchema = z
  .object({
    id: z.string().min(1),
    cards: z.number().int().min(1).max(12),
    dealerIndex: z.number().int().nonnegative(),
    bids: z.array(z.number().int().min(0).max(12).nullable()),
    tricks: z.array(z.number().int().min(0).max(12).nullable()),
    status: z.enum(["bidding", "playing", "complete"]),
  })
  .superRefine((round, context) => {
    if (round.status !== "complete") return
    if (
      round.bids.some((value) => value === null) ||
      round.tricks.some((value) => value === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Completed rounds require every bid and trick count.",
      })
      return
    }
    if (
      round.bids.reduce<number>((sum, value) => sum + (value ?? 0), 0) ===
      round.cards
    ) {
      context.addIssue({
        code: "custom",
        path: ["bids"],
        message: "Bids cannot equal the available tricks.",
      })
    }
    if (
      round.tricks.reduce<number>((sum, value) => sum + (value ?? 0), 0) !==
      round.cards
    ) {
      context.addIssue({
        code: "custom",
        path: ["tricks"],
        message: "Tricks must equal the available count.",
      })
    }
  })

export const gameSchema = z
  .object({
    id: z.string().min(1),
    revision: z.number().int().nonnegative(),
    createdAt: z.string().datetime(),
    startedAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime(),
    players: z.array(playerSchema).min(3).max(6),
    schedule: z.array(z.number().int().min(1).max(12)).min(1),
    rounds: z.array(roundSchema),
    status: z.enum(["active", "finished"]),
    tieResolution: z.enum(["shared", "extra"]).nullable(),
  })
  .superRefine((game, context) => {
    if (
      new Set(game.players.map((player) => player.id)).size !==
      game.players.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Player IDs must be unique.",
      })
    }
    if (
      new Set(game.players.map((player) => player.name.toLocaleLowerCase("es")))
        .size !== game.players.length
    ) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Player names must be unique.",
      })
    }
    if (game.rounds.length > game.schedule.length) {
      context.addIssue({
        code: "custom",
        path: ["rounds"],
        message: "A game cannot contain unscheduled rounds.",
      })
    }
    if (
      game.status === "finished" &&
      (game.rounds.length !== game.schedule.length ||
        game.rounds.some((round) => round.status !== "complete"))
    ) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "Finished games require every scheduled round to be complete.",
      })
    }
    for (const [index, round] of game.rounds.entries()) {
      if (round.dealerIndex >= game.players.length) {
        context.addIssue({
          code: "custom",
          path: ["rounds", index, "dealerIndex"],
          message: "Dealer must be a player.",
        })
      }
      if (
        round.bids.length !== game.players.length ||
        round.tricks.length !== game.players.length
      ) {
        context.addIssue({
          code: "custom",
          path: ["rounds", index],
          message: "Each player needs one bid and tricks entry.",
        })
      }
      if (round.cards !== game.schedule[index]) {
        context.addIssue({
          code: "custom",
          path: ["rounds", index, "cards"],
          message: "Round cards must match the schedule.",
        })
      }
      for (const value of [...round.bids, ...round.tricks]) {
        if (value !== null && value > round.cards) {
          context.addIssue({
            code: "custom",
            path: ["rounds", index],
            message: "Entries cannot exceed the tricks available.",
          })
          break
        }
      }
    }
  })
  .transform((game) => ({
    ...game,
    startedAt: game.startedAt ?? game.createdAt,
  }))

export const gameBackupSchema = z.object({
  format: z.literal("pocha-score-backup"),
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  games: z.array(gameSchema),
})

export type Player = z.infer<typeof playerSchema>
export type PochaRound = z.infer<typeof roundSchema>
export type PochaGame = z.infer<typeof gameSchema>
export type GameBackup = z.infer<typeof gameBackupSchema>
