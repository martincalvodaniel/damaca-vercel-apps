import { z } from "zod"

const instantSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value).toISOString())

export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(32),
})

export const lifeChangeSchema = z.object({
  id: z.string().min(1),
  type: z.literal("change"),
  playerId: z.string().min(1),
  before: z.number().int().nonnegative(),
  after: z.number().int().nonnegative(),
  createdAt: instantSchema,
})

export const lifeUndoSchema = z.object({
  id: z.string().min(1),
  type: z.literal("undo"),
  targetId: z.string().min(1),
  playerId: z.string().min(1),
  before: z.number().int().nonnegative(),
  after: z.number().int().nonnegative(),
  createdAt: instantSchema,
})

export const gameEventSchema = z.discriminatedUnion("type", [
  lifeChangeSchema,
  lifeUndoSchema,
])

export const gameSchema = z
  .object({
    id: z.string().min(1),
    revision: z.number().int().nonnegative(),
    createdAt: instantSchema,
    startedAt: instantSchema,
    updatedAt: instantSchema,
    endedAt: instantSchema.optional(),
    players: z.array(playerSchema).length(2),
    lives: z.array(z.number().int().nonnegative()).length(2),
    startingPlayerId: z.string().min(1),
    status: z.enum(["active", "finished", "abandoned"]),
    winnerId: z.string().min(1).optional(),
    events: z.array(gameEventSchema),
  })
  .superRefine((game, context) => {
    const ids = game.players.map((player) => player.id)
    if (new Set(ids).size !== 2) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Player IDs must be unique.",
      })
    }
    if (
      new Set(
        game.players.map((player) => player.name.trim().toLocaleLowerCase("es"))
      ).size !== 2
    ) {
      context.addIssue({
        code: "custom",
        path: ["players"],
        message: "Player names must be unique.",
      })
    }
    if (!ids.includes(game.startingPlayerId)) {
      context.addIssue({
        code: "custom",
        path: ["startingPlayerId"],
        message: "The starting player must belong to the game.",
      })
    }
    if (
      game.status === "finished" &&
      (!game.winnerId || !ids.includes(game.winnerId))
    ) {
      context.addIssue({
        code: "custom",
        path: ["winnerId"],
        message: "Finished games require a player as winner.",
      })
    }
    if (game.status !== "finished" && game.winnerId) {
      context.addIssue({
        code: "custom",
        path: ["winnerId"],
        message: "Only finished games can have a winner.",
      })
    }
    if ((game.status === "active") === Boolean(game.endedAt)) {
      context.addIssue({
        code: "custom",
        path: ["endedAt"],
        message: "Only closed games can have an end time.",
      })
    }
    const eventIds = game.events.map((event) => event.id)
    if (new Set(eventIds).size !== eventIds.length) {
      context.addIssue({
        code: "custom",
        path: ["events"],
        message: "Event IDs must be unique.",
      })
    }
    for (const [index, event] of game.events.entries()) {
      if (!ids.includes(event.playerId)) {
        context.addIssue({
          code: "custom",
          path: ["events", index, "playerId"],
          message: "Every event must reference a game player.",
        })
      }
      if (event.type === "change" && event.before === event.after) {
        context.addIssue({
          code: "custom",
          path: ["events", index],
          message: "Life changes must change the player's total.",
        })
      }
    }
  })

export const gameBackupSchema = z.object({
  format: z.literal("card-wars-backup"),
  version: z.literal(1),
  exportedAt: instantSchema,
  games: z.array(gameSchema),
})

export type GamePlayer = z.infer<typeof playerSchema>
export type GameEvent = z.infer<typeof gameEventSchema>
export type CardWarsGame = z.infer<typeof gameSchema>
export type GameBackup = z.infer<typeof gameBackupSchema>
