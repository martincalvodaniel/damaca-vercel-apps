import { describe, expect, test } from "bun:test"
import type { WeeklyMealSlot } from "@/schemas/weekly-meal-plan"
import { moveOrSwapMealSlots } from "./meal-slot-move"

const slots: WeeklyMealSlot[] = [
  {
    date: "2026-10-05",
    mealType: "lunch",
    dishId: "507f1f77bcf86cd799439011",
    isExecuted: false,
  },
  {
    date: "2026-10-06",
    mealType: "dinner",
    dishId: "507f1f77bcf86cd799439012",
    isExecuted: false,
  },
]

describe("meal slot moves", () => {
  test("moves a meal into an empty slot", () => {
    expect(
      moveOrSwapMealSlots(
        slots,
        { date: "2026-10-05", mealType: "lunch" },
        { date: "2026-10-07", mealType: "dinner" }
      )
    ).toEqual([
      slots[1],
      {
        date: "2026-10-07",
        mealType: "dinner",
        dishId: "507f1f77bcf86cd799439011",
        isExecuted: false,
      },
    ])
  })

  test("swaps the meals when the destination is occupied", () => {
    expect(
      moveOrSwapMealSlots(
        slots,
        { date: "2026-10-05", mealType: "lunch" },
        { date: "2026-10-06", mealType: "dinner" }
      )
    ).toEqual([
      {
        date: "2026-10-06",
        mealType: "dinner",
        dishId: "507f1f77bcf86cd799439011",
        isExecuted: false,
      },
      {
        date: "2026-10-05",
        mealType: "lunch",
        dishId: "507f1f77bcf86cd799439012",
        isExecuted: false,
      },
    ])
  })
})
