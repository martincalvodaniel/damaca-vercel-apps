import { describe, expect, test } from "bun:test"
import {
  getCurrentWeekStart,
  getMadridIsoDate,
  getWeekStartForDate,
} from "@/features/meal-planning/week-utils"

describe("meal planning week utilities", () => {
  test("finds the Monday for any date in a week", () => {
    expect(getWeekStartForDate("2026-10-01")).toBe("2026-09-28")
    expect(getWeekStartForDate("2026-10-04")).toBe("2026-09-28")
    expect(getWeekStartForDate("2026-10-05")).toBe("2026-10-05")
  })

  test("uses the Madrid calendar date around midnight", () => {
    const sundayNight = new Date("2026-10-04T22:30:00.000Z")

    expect(getMadridIsoDate(sundayNight)).toBe("2026-10-05")
    expect(getCurrentWeekStart(sundayNight)).toBe("2026-10-05")
  })
})
