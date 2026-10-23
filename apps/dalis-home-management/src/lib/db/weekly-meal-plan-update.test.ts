import { describe, expect, test } from "bun:test"
import { ObjectId } from "mongodb"
import {
  buildCopiedWeeklyMealPlanUpdate,
  buildWeeklyMealSlotMoveUpdate,
  buildWeeklyMealSlotUpdate,
} from "./weekly-meal-plan-update"

describe("weekly meal slot update", () => {
  const input = {
    weekStart: "2026-10-05",
    date: "2026-10-07",
    mealType: "dinner" as const,
    dishId: "507f1f77bcf86cd799439011",
  }
  const now = new Date("2026-10-02T08:00:00.000Z")

  test("replaces only the selected slot atomically", () => {
    const dishId = new ObjectId(input.dishId)
    const update = buildWeeklyMealSlotUpdate(input, dishId, now)
    const serialized = JSON.stringify(update)

    expect(serialized).toContain("$filter")
    expect(serialized).toContain("$concatArrays")
    expect(serialized).toContain("$$slot.date")
    expect(serialized).toContain("$$slot.mealType")
    expect(serialized).toContain(input.date)
    expect(serialized).toContain(input.mealType)
    expect(update).toMatchObject([
      {
        $set: {
          weekStart: input.weekStart,
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ])
  })

  test("removes the selected slot when no dish is supplied", () => {
    const update = buildWeeklyMealSlotUpdate(
      { ...input, dishId: null },
      null,
      now
    )

    expect(JSON.stringify(update)).not.toContain("$concatArrays")
    expect(JSON.stringify(update)).toContain("$filter")
  })

  test("moves or swaps two slots atomically", () => {
    const update = buildWeeklyMealSlotMoveUpdate(
      {
        weekStart: "2026-10-05",
        source: { date: "2026-10-07", mealType: "dinner" },
        destination: { date: "2026-10-09", mealType: "lunch" },
      },
      now
    )
    const serialized = JSON.stringify(update)

    expect(serialized).toContain("$concatArrays")
    expect(serialized).toContain("$$sourceSlots.dishId")
    expect(serialized).toContain("$$destinationSlots.dishId")
    expect(serialized).toContain("$cond")
    expect(update).toMatchObject([{ $set: { updatedAt: now } }])
  })

  test("builds a complete copied week update", () => {
    const dishId = new ObjectId(input.dishId)
    const slots = [
      {
        date: "2026-10-14",
        mealType: "dinner" as const,
        dishId,
        isExecuted: false,
      },
    ]

    expect(buildCopiedWeeklyMealPlanUpdate("2026-10-12", slots, now)).toEqual([
      {
        $set: {
          weekStart: "2026-10-12",
          slots,
          createdAt: { $ifNull: ["$createdAt", now] },
          updatedAt: now,
        },
      },
    ])
  })
})
