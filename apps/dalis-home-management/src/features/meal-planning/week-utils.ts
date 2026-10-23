import { addDaysToIsoDate } from "@/schemas/weekly-meal-plan"

const madridDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Madrid",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function getWeekStartForDate(date: string): string {
  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay()
  const daysSinceMonday = (dayOfWeek + 6) % 7

  return addDaysToIsoDate(date, -daysSinceMonday)
}

export function getMadridIsoDate(now = new Date()): string {
  const parts = madridDateFormatter.formatToParts(now)
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

export function getCurrentWeekStart(now = new Date()): string {
  return getWeekStartForDate(getMadridIsoDate(now))
}
