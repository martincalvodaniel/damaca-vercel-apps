import { describe, expect, test as it } from "bun:test"
import type { EventAttendee } from "@/lib/domain/entities/event"
import {
  compareEventsChronologicalAsc,
  eventIsPlottable,
  formatDuration,
  formatEventDateTime,
  formatTimeOfDay,
  parseTimeOfDay,
  totalSeats,
} from "./eventsUi"

describe("formatEventDateTime", () => {
  it("formats a full date", () => {
    expect(
      formatEventDateTime({
        date: "2026-04-29",
        year: 2026,
        month: 4,
        day: 29,
      })
    ).toBe("29 abr 2026")
  })

  it("appends a time when hour is set", () => {
    expect(
      formatEventDateTime({
        date: "2026-04-29",
        year: 2026,
        month: 4,
        day: 29,
        hour: 9,
        minute: 5,
      })
    ).toBe("29 abr 2026 09:05")
  })

  it("defaults minute to 00 when absent", () => {
    expect(
      formatEventDateTime({
        date: "2026-04-29",
        year: 2026,
        month: 4,
        day: 29,
        hour: 18,
      })
    ).toBe("29 abr 2026 18:00")
  })

  it("formats year+month only", () => {
    expect(formatEventDateTime({ date: undefined, year: 2026, month: 4 })).toBe(
      "abril de 2026"
    )
  })

  it("formats recurring events with a Spanish weekday and time", () => {
    expect(
      formatEventDateTime({
        date: undefined,
        year: 2026,
        month: 4,
        dayOfWeek: 2,
        hour: 9,
        minute: 5,
      })
    ).toBe("abril de 2026 los martes 09:05")
  })

  it.each([
    [0, "domingos"],
    [1, "lunes"],
    [2, "martes"],
    [3, "miércoles"],
    [4, "jueves"],
    [5, "viernes"],
    [6, "sábados"],
  ] as const)(
    "uses the correct recurring plural for weekday %s",
    (dayOfWeek, weekday) => {
      expect(formatEventDateTime({ year: 2026, month: 4, dayOfWeek })).toBe(
        `abril de 2026 los ${weekday}`
      )
    }
  )

  it("formats year only", () => {
    expect(formatEventDateTime({ date: undefined, year: 2026 })).toBe("2026")
  })

  it("formats time only", () => {
    expect(
      formatEventDateTime({
        date: undefined,
        hour: 10,
        minute: 30,
      })
    ).toBe("10:30")
  })

  it("returns a Spanish fallback when nothing is set", () => {
    expect(formatEventDateTime({})).toBe("Sin fecha")
  })
})

describe("formatDuration", () => {
  it("returns em-dash for undefined or non-positive values", () => {
    expect(formatDuration(undefined)).toBe("—")
    expect(formatDuration(0)).toBe("—")
    expect(formatDuration(-30)).toBe("—")
  })

  it("formats minutes only when < 60", () => {
    expect(formatDuration(45)).toBe("45m")
    expect(formatDuration(1)).toBe("1m")
  })

  it("formats whole hours", () => {
    expect(formatDuration(60)).toBe("1h")
    expect(formatDuration(120)).toBe("2h")
  })

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m")
    expect(formatDuration(125)).toBe("2h 5m")
  })
})

describe("totalSeats", () => {
  it("returns 0 for empty list", () => {
    expect(totalSeats([])).toBe(0)
  })

  it("sums seats across attendees", () => {
    const attendees: EventAttendee[] = [
      { clientId: "a", seats: 2, addedAt: new Date() },
      { clientId: "b", seats: 3, addedAt: new Date() },
      { clientId: "c", seats: 1, addedAt: new Date() },
    ]
    expect(totalSeats(attendees)).toBe(6)
  })
})

describe("eventIsPlottable", () => {
  it("returns true when date is set", () => {
    expect(eventIsPlottable({ date: "2026-04-29" })).toBe(true)
  })
  it("returns false when date is undefined or empty", () => {
    expect(eventIsPlottable({ date: undefined })).toBe(false)
    expect(eventIsPlottable({ date: "" })).toBe(false)
  })
})

describe("formatTimeOfDay", () => {
  it("returns empty string when hour is undefined", () => {
    expect(formatTimeOfDay(undefined, undefined)).toBe("")
    expect(formatTimeOfDay(undefined, 30)).toBe("")
  })

  it("formats hour with zero padding and defaults minute to 0", () => {
    expect(formatTimeOfDay(9, undefined)).toBe("09:00")
    expect(formatTimeOfDay(0, 0)).toBe("00:00")
  })

  it("formats hour and minute with zero padding", () => {
    expect(formatTimeOfDay(18, 5)).toBe("18:05")
    expect(formatTimeOfDay(23, 59)).toBe("23:59")
  })
})

describe("parseTimeOfDay", () => {
  it("returns empty object for empty string", () => {
    expect(parseTimeOfDay("")).toEqual({})
    expect(parseTimeOfDay("   ")).toEqual({})
  })

  it("parses HH:MM", () => {
    expect(parseTimeOfDay("09:05")).toEqual({ hour: 9, minute: 5 })
    expect(parseTimeOfDay("23:59")).toEqual({ hour: 23, minute: 59 })
  })

  it("parses HH:MM:SS by ignoring seconds", () => {
    expect(parseTimeOfDay("18:30:00")).toEqual({ hour: 18, minute: 30 })
  })

  it("returns empty object for malformed values", () => {
    expect(parseTimeOfDay("abc")).toEqual({})
    expect(parseTimeOfDay("25:00")).toEqual({})
    expect(parseTimeOfDay("12:60")).toEqual({})
  })
})

describe("compareEventsChronologicalAsc", () => {
  type Cmp = Parameters<typeof compareEventsChronologicalAsc>[0]
  const make = (parts: Partial<Cmp> = {}): Cmp => ({
    createdAt: new Date(0),
    ...parts,
  })
  const sign = (n: number) => (n < 0 ? -1 : n > 0 ? 1 : 0)

  it("same day, one with no time comes first", () => {
    const noTime = make({ year: 2024, month: 1, day: 1 })
    const timed = make({ year: 2024, month: 1, day: 1, hour: 10, minute: 0 })
    expect(sign(compareEventsChronologicalAsc(noTime, timed))).toBe(-1)
    expect(sign(compareEventsChronologicalAsc(timed, noTime))).toBe(1)
  })

  it("same day, 09:30 < 10:00", () => {
    const earlier = make({ year: 2024, month: 1, day: 1, hour: 9, minute: 30 })
    const later = make({ year: 2024, month: 1, day: 1, hour: 10, minute: 0 })
    expect(sign(compareEventsChronologicalAsc(earlier, later))).toBe(-1)
  })

  it("same year/month, undefined day < day 1", () => {
    const noDay = make({ year: 2024, month: 1 })
    const day1 = make({ year: 2024, month: 1, day: 1 })
    expect(sign(compareEventsChronologicalAsc(noDay, day1))).toBe(-1)
  })

  it("same year/month, recurring events sort by dayOfWeek", () => {
    const monday = make({ year: 2024, month: 1, dayOfWeek: 1 })
    const thursday = make({ year: 2024, month: 1, dayOfWeek: 4 })
    const sunday = make({ year: 2024, month: 1, dayOfWeek: 0 })
    const sorted = [sunday, thursday, monday].sort(
      compareEventsChronologicalAsc
    )
    expect(sorted.map((e) => e.dayOfWeek)).toEqual([1, 4, 0])
  })

  it("specific day takes precedence over dayOfWeek fallback", () => {
    const recurringTuesday = make({ year: 2024, month: 1, dayOfWeek: 2 })
    const dayOne = make({ year: 2024, month: 1, day: 1 })
    expect(sign(compareEventsChronologicalAsc(dayOne, recurringTuesday))).toBe(
      -1
    )
  })

  it("same year, undefined month < month 1", () => {
    const noMonth = make({ year: 2024 })
    const m1 = make({ year: 2024, month: 1 })
    expect(sign(compareEventsChronologicalAsc(noMonth, m1))).toBe(-1)
  })

  it("undefined year < any year", () => {
    const noYear = make({})
    const y = make({ year: 2024 })
    expect(sign(compareEventsChronologicalAsc(noYear, y))).toBe(-1)
  })

  it("identical date fields tie-break by createdAt ascending", () => {
    const a = make({
      year: 2024,
      month: 1,
      day: 1,
      hour: 10,
      minute: 0,
      createdAt: new Date("2024-01-01T00:00:00Z"),
    })
    const b = make({
      year: 2024,
      month: 1,
      day: 1,
      hour: 10,
      minute: 0,
      createdAt: new Date("2024-02-01T00:00:00Z"),
    })
    expect(sign(compareEventsChronologicalAsc(a, b))).toBe(-1)
    expect(sign(compareEventsChronologicalAsc(b, a))).toBe(1)
    expect(compareEventsChronologicalAsc(a, a)).toBe(0)
  })

  it("prompt example: same day, no time before timed", () => {
    const events = [
      make({ year: 2024, month: 1, day: 1, hour: 10, minute: 0 }),
      make({ year: 2024, month: 1, day: 1 }),
    ]
    const sorted = events.slice().sort(compareEventsChronologicalAsc)
    expect(sorted[0].hour).toBeUndefined()
    expect(sorted[1].hour).toBe(10)
  })

  it("prompt example: same month, no day before dated", () => {
    const events = [
      make({ year: 2024, month: 1, day: 1 }),
      make({ year: 2024, month: 1 }),
    ]
    const sorted = events.slice().sort(compareEventsChronologicalAsc)
    expect(sorted[0].day).toBeUndefined()
    expect(sorted[1].day).toBe(1)
  })

  it("full chronological ordering across mixed events", () => {
    const events = [
      make({ year: 2024, month: 2, day: 1 }),
      make({ year: 2024, month: 1, day: 1, hour: 10 }),
      make({ year: 2024, month: 1, day: 1 }),
      make({ year: 2024, month: 1 }),
      make({ year: 2024 }),
      make({}),
    ]
    const sorted = events.slice().sort(compareEventsChronologicalAsc)
    expect(sorted.map((e) => [e.year, e.month, e.day, e.hour])).toEqual([
      [undefined, undefined, undefined, undefined],
      [2024, undefined, undefined, undefined],
      [2024, 1, undefined, undefined],
      [2024, 1, 1, undefined],
      [2024, 1, 1, 10],
      [2024, 2, 1, undefined],
    ])
  })
})
