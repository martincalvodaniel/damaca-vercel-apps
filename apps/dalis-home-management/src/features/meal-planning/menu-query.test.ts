import { expect, test as it } from "bun:test"
import {
  buildMenuResult,
  formatMenu,
  resolveMenuQuery,
} from "@/features/meal-planning/menu-query"
import { menuQuerySchema } from "@/schemas/mcp-menu"

it("resolves the five relative periods around a Madrid midnight at the end of the year", () => {
  const now = new Date("2024-12-28T23:01:00Z")
  const periods = {
    today: ["2024-12-29", "2024-12-29"],
    tomorrow: ["2024-12-30", "2024-12-30"],
    last_week: ["2024-12-16", "2024-12-22"],
    this_week: ["2024-12-23", "2024-12-29"],
    next_week: ["2024-12-30", "2025-01-05"],
  }
  for (const [period, [startDate, endDate]] of Object.entries(periods)) {
    expect(
      resolveMenuQuery(menuQuerySchema.parse({ period }), now)
    ).toMatchObject({
      today: "2024-12-29",
      startDate,
      endDate,
    })
  }
})

it("queries a calendar date or the ISO week containing it", () => {
  expect(resolveMenuQuery({ date: "2024-02-29" }).dates).toEqual(["2024-02-29"])
  expect(resolveMenuQuery({ weekOf: "2025-01-01" })).toMatchObject({
    startDate: "2024-12-30",
    endDate: "2025-01-05",
  })
  for (const invalid of [
    {},
    { date: "2025-02-29" },
    { weekOf: "2025-2-01" },
    { date: "2025-01-01", period: "today" },
  ]) {
    expect(menuQuerySchema.safeParse(invalid).success).toBe(false)
  }
})

it("preserves unplanned days and distinguishes missing dishes", () => {
  const range = resolveMenuQuery({ weekOf: "2025-01-01" })
  const result = buildMenuResult(
    range,
    [
      {
        date: "2024-12-30",
        mealType: "lunch",
        dishId: "stew",
        isExecuted: true,
      },
      {
        date: "2024-12-30",
        mealType: "dinner",
        dishId: "missing",
        isExecuted: false,
      },
    ],
    new Map([["stew", "Lentejas"]])
  )
  expect(result.days).toHaveLength(7)
  expect(result.days[0]).toEqual({
    date: "2024-12-30",
    lunch: { status: "planned", dish: "Lentejas" },
    dinner: { status: "unavailable", dish: null },
  })
  expect(result.days[6]?.lunch).toEqual({ status: "unplanned", dish: null })
  expect(formatMenu(result)).toContain(
    "Comida: Lentejas · Cena: Plato no disponible"
  )
  expect(
    buildMenuResult(range, [], new Map()).days.every(
      ({ lunch, dinner }) =>
        lunch.status === "unplanned" && dinner.status === "unplanned"
    )
  ).toBe(true)
})
