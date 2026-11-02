import { describe, expect, test as it } from "bun:test"
import {
  householdDateSchema,
  parseHouseholdTaskCommand,
} from "./household-task"

const taskId = "93a8bcc4-47a1-4466-ab01-c0860c595dd2"
const occurrenceId = "758ab084-3523-40f0-9a32-2a55cdbf44e3"
const today = "2026-11-02"

describe("household task validation", () => {
  it("rejects malformed and impossible dates", () => {
    for (const date of [
      "2026-02-29",
      "2026-13-01",
      "2026-04-31",
      "2026-2-03",
      "bad",
      "0000-01-01",
    ]) {
      expect(householdDateSchema.safeParse(date).success).toBe(false)
    }
    expect(householdDateSchema.safeParse("2024-02-29").success).toBe(true)
  })
  it("validates names and positive whole-day intervals", () => {
    const base = { kind: "create", taskId, name: "Sheets", intervalDays: 7 }
    expect(parseHouseholdTaskCommand(base, today).success).toBe(true)
    for (const intervalDays of [0, -1, 1.5, Infinity, 36501]) {
      expect(
        parseHouseholdTaskCommand({ ...base, intervalDays }, today).success
      ).toBe(false)
    }
    expect(
      parseHouseholdTaskCommand({ ...base, name: " " }, today).success
    ).toBe(false)
    expect(
      parseHouseholdTaskCommand({ ...base, extra: true }, today).success
    ).toBe(false)
    expect(
      parseHouseholdTaskCommand({ ...base, taskId: "not-an-id" }, today).success
    ).toBe(false)
  })
  it("rejects future executions in every execution command", () => {
    for (const kind of ["record", "complete", "edit-execution"]) {
      const command = {
        kind,
        taskId,
        occurrenceId,
        completedDate: "2026-11-03",
        ...(kind === "edit-execution" ? { expectedCompletedDate: today } : {}),
      }
      expect(parseHouseholdTaskCommand(command, today).success).toBe(false)
      expect(
        parseHouseholdTaskCommand({ ...command, completedDate: today }, today)
          .success
      ).toBe(true)
    }
    expect(
      parseHouseholdTaskCommand(
        {
          kind: "create",
          taskId,
          name: "Sheets",
          intervalDays: 7,
          initialDate: "2026-11-03",
        },
        today
      ).success
    ).toBe(false)
  })
  it("allows future plans and requires expected values when editing", () => {
    expect(
      parseHouseholdTaskCommand(
        { kind: "schedule", taskId, occurrenceId, date: "2027-01-01" },
        today
      ).success
    ).toBe(true)
    expect(
      parseHouseholdTaskCommand(
        { kind: "move", taskId, occurrenceId, date: today },
        today
      ).success
    ).toBe(false)
    expect(
      parseHouseholdTaskCommand(
        { kind: "delete-execution", taskId, occurrenceId },
        today
      ).success
    ).toBe(false)
  })
})
