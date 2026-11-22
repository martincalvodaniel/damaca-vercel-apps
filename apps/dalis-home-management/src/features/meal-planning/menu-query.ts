import {
  getMadridIsoDate,
  getWeekStartForDate,
} from "@/features/meal-planning/week-utils"
import type { MenuQuery, MenuResult } from "@/schemas/mcp-menu"
import {
  addDaysToIsoDate,
  getWeekDates,
  type MealType,
  type WeeklyMealSlot,
} from "@/schemas/weekly-meal-plan"

function weekRange(startDate: string) {
  return {
    startDate,
    endDate: addDaysToIsoDate(startDate, 6),
    dates: getWeekDates(startDate),
  }
}

function dayRange(date: string) {
  return { startDate: date, endDate: date, dates: [date] }
}

export function resolveMenuQuery(query: MenuQuery, now = new Date()) {
  const today = getMadridIsoDate(now)
  if (query.date) return { today, ...dayRange(query.date) }
  if (query.weekOf)
    return { today, ...weekRange(getWeekStartForDate(query.weekOf)) }
  if (query.period === "today" || query.period === "tomorrow") {
    return {
      today,
      ...dayRange(
        query.period === "today" ? today : addDaysToIsoDate(today, 1)
      ),
    }
  }
  if (!query.period) throw new Error("A menu query period is required")
  const offset = { last_week: -7, this_week: 0, next_week: 7 }[query.period]
  return {
    today,
    ...weekRange(addDaysToIsoDate(getWeekStartForDate(today), offset)),
  }
}

export function buildMenuResult(
  { today, startDate, endDate, dates }: ReturnType<typeof resolveMenuQuery>,
  slots: readonly WeeklyMealSlot[],
  dishNames: ReadonlyMap<string, string>
): MenuResult {
  function getMeal(
    date: string,
    mealType: MealType
  ): MenuResult["days"][number]["lunch"] {
    const slot = slots.find(
      (entry) => entry.date === date && entry.mealType === mealType
    )
    if (!slot) return { status: "unplanned", dish: null }
    const dish = dishNames.get(slot.dishId)
    return dish === undefined
      ? { status: "unavailable", dish: null }
      : { status: "planned", dish }
  }
  return {
    today,
    startDate,
    endDate,
    days: dates.map((date) => ({
      date,
      lunch: getMeal(date, "lunch"),
      dinner: getMeal(date, "dinner"),
    })),
  }
}

export function formatMenu(result: MenuResult) {
  const title =
    result.startDate === result.endDate
      ? result.startDate
      : `${result.startDate} a ${result.endDate}`
  const formatMeal = ({ status, dish }: MenuResult["days"][number]["lunch"]) =>
    dish ??
    (status === "unavailable" ? "Plato no disponible" : "Sin planificar")
  return [
    `Menú del ${title} (hoy en Madrid: ${result.today})`,
    ...result.days.map(
      ({ date, lunch, dinner }) =>
        `${date} · Comida: ${formatMeal(lunch)} · Cena: ${formatMeal(dinner)}`
    ),
  ].join("\n")
}
