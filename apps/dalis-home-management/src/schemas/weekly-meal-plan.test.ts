import { describe, expect, test } from "bun:test"
import {
  addDaysToIsoDate,
  getWeekDates,
  weeklyMealPlanSchema,
  weeklyMealSlotExecutionWithInventoryInputSchema,
  weeklyMealSlotInputSchema,
  weeklyMealSlotMoveInputSchema,
} from "@/schemas/weekly-meal-plan"

describe("weekly meal plan dates", () => {
  test("builds all seven dates from a Monday", () => {
    expect(getWeekDates("2026-10-05")).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ])
    expect(addDaysToIsoDate("2026-12-28", 7)).toBe("2027-01-04")
  })

  test("rejects a week that does not start on Monday", () => {
    const result = weeklyMealSlotInputSchema.safeParse({
      weekStart: "2026-10-06",
      date: "2026-10-06",
      mealType: "lunch",
      dishId: null,
    })

    expect(result.success).toBe(false)
  })

  test("rejects a slot outside the selected week", () => {
    const result = weeklyMealSlotInputSchema.safeParse({
      weekStart: "2026-10-05",
      date: "2026-10-12",
      mealType: "dinner",
      dishId: "507f1f77bcf86cd799439011",
    })

    expect(result.success).toBe(false)
  })

  test("rejects duplicate slots in a stored plan", () => {
    const now = new Date("2026-10-02T08:00:00.000Z")
    const slot = {
      date: "2026-10-05",
      mealType: "lunch" as const,
      dishId: "507f1f77bcf86cd799439011",
      isExecuted: false,
    }
    const result = weeklyMealPlanSchema.safeParse({
      id: "507f191e810c19729de860ea",
      weekStart: "2026-10-05",
      slots: [slot, slot],
      createdAt: now,
      updatedAt: now,
    })

    expect(result.success).toBe(false)
  })

  test("defaults stored slots to not executed", () => {
    const now = new Date("2026-10-02T08:00:00.000Z")
    const result = weeklyMealPlanSchema.parse({
      id: "507f191e810c19729de860ea",
      weekStart: "2026-10-05",
      slots: [
        {
          date: "2026-10-05",
          mealType: "lunch",
          dishId: "507f1f77bcf86cd799439011",
        },
      ],
      createdAt: now,
      updatedAt: now,
    })

    expect(result.slots[0]?.isExecuted).toBe(false)
  })

  test("accepts moving a meal to another slot in the same week", () => {
    expect(
      weeklyMealSlotMoveInputSchema.safeParse({
        weekStart: "2026-10-05",
        source: { date: "2026-10-05", mealType: "lunch" },
        destination: { date: "2026-10-08", mealType: "dinner" },
      }).success
    ).toBe(true)
  })

  test("accepts unique final inventory quantities for an executed meal", () => {
    const result = weeklyMealSlotExecutionWithInventoryInputSchema.safeParse({
      weekStart: "2026-10-05",
      date: "2026-10-05",
      mealType: "lunch",
      items: [
        {
          inventoryItemId: "507f1f77bcf86cd799439011",
          quantity: 2,
        },
      ],
    })

    expect(result.success).toBe(true)
  })

  test("rejects repeated inventory quantities for an executed meal", () => {
    const result = weeklyMealSlotExecutionWithInventoryInputSchema.safeParse({
      weekStart: "2026-10-05",
      date: "2026-10-05",
      mealType: "lunch",
      items: [
        {
          inventoryItemId: "507f1f77bcf86cd799439011",
          quantity: 2,
        },
        {
          inventoryItemId: "507f1f77bcf86cd799439011",
          quantity: 1,
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test("rejects moves outside the week or to the same slot", () => {
    const outsideWeek = weeklyMealSlotMoveInputSchema.safeParse({
      weekStart: "2026-10-05",
      source: { date: "2026-10-05", mealType: "lunch" },
      destination: { date: "2026-10-12", mealType: "dinner" },
    })
    const sameSlot = weeklyMealSlotMoveInputSchema.safeParse({
      weekStart: "2026-10-05",
      source: { date: "2026-10-05", mealType: "lunch" },
      destination: { date: "2026-10-05", mealType: "lunch" },
    })

    expect(outsideWeek.success).toBe(false)
    expect(sameSlot.success).toBe(false)
  })
})
