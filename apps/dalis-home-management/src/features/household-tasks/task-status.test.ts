import { describe, expect, test as it } from "bun:test"
import { addDays, dayStatus, monthDays, taskStatus } from "./task-status"

describe("household task dates and status", () => {
  it("keeps history without deadlines for tasks without periodicity", () => {
    const status = taskStatus(
      null,
      [{ date: "2026-01-01", completedDate: "2026-01-01" }],
      "2026-11-02"
    )
    expect(status.lastExecution).toBe("2026-01-01")
    expect(status.dueDate).toBeUndefined()
    expect(status.state).toBe("unknown")
  })
  it("does not warn before the first execution", () => {
    expect(taskStatus(10, [], "2026-11-02").state).toBe("unknown")
  })
  it("warns at the rounded-up eighty percent threshold", () => {
    const entries = [{ date: "2026-10-01", completedDate: "2026-10-01" }]
    expect(taskStatus(7, entries, "2026-10-06").state).toBe("normal")
    expect(taskStatus(7, entries, "2026-10-07").state).toBe("warning")
    expect(taskStatus(7, entries, "2026-10-08").state).toBe("overdue")
  })
  it("only timely future plans suppress warnings", () => {
    const entries = [{ date: "2026-10-01", completedDate: "2026-10-01" }]
    expect(
      taskStatus(10, [...entries, { date: "2026-10-10" }], "2026-10-09").state
    ).toBe("normal")
    expect(
      taskStatus(10, [...entries, { date: "2026-10-12" }], "2026-10-09").state
    ).toBe("warning")
    expect(
      taskStatus(10, [...entries, { date: "2026-10-08" }], "2026-10-09").state
    ).toBe("warning")
    expect(
      taskStatus(10, [...entries, { date: "2026-10-12" }], "2026-10-11").state
    ).toBe("overdue")
  })
  it("recomputes from actual execution dates", () => {
    expect(
      taskStatus(
        10,
        [{ date: "2026-10-01", completedDate: "2026-10-03" }],
        "2026-10-09"
      ).dueDate
    ).toBe("2026-10-13")
  })
  it("recalculates the limit after correcting or removing the latest execution", () => {
    const previous = { date: "2026-10-01", completedDate: "2026-10-01" }
    const latest = { date: "2026-10-10", completedDate: "2026-10-12" }
    expect(taskStatus(7, [previous, latest], "2026-10-13").dueDate).toBe(
      "2026-10-19"
    )
    expect(
      taskStatus(
        7,
        [previous, { ...latest, completedDate: "2026-10-11" }],
        "2026-10-13"
      ).dueDate
    ).toBe("2026-10-18")
    expect(taskStatus(7, [previous], "2026-10-13").dueDate).toBe("2026-10-08")
  })
  it("handles leap years, year boundaries and daylight saving", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30")
    expect(monthDays("2026-11")[6]).toBe("2026-11-01")
    expect(monthDays("2024-02").filter(Boolean)).toHaveLength(29)
    expect(monthDays("2026-12").at(-1)).toBe("2026-12-31")
  })
  it("pending tasks take precedence over completed tasks", () => {
    expect(dayStatus([])).toBe("empty")
    expect(
      dayStatus([{ date: "2026-11-02", completedDate: "2026-11-02" }])
    ).toBe("completed")
    expect(
      dayStatus([
        { date: "2026-11-02" },
        { date: "2026-11-02", completedDate: "2026-11-02" },
      ])
    ).toBe("pending")
  })
})
