import "server-only"

import { beforeEach, describe, expect, test as it, mock } from "bun:test"
import { MongoServerError } from "mongodb"
import type { HouseholdTaskCommand } from "@/schemas/household-task"

interface StoredDocument {
  _id: string
  [key: string]: unknown
}
type Filter = Record<string, unknown>
const stores = new Map<string, Map<string, StoredDocument>>()
let failTaskInsert = false
let failPendingCleanup = false
function matches(document: StoredDocument, filter: Filter) {
  return Object.entries(filter).every(([key, value]) => {
    if (typeof value === "object" && value !== null && "$exists" in value)
      return (document[key] !== undefined) === value.$exists
    return document[key] === value
  })
}
function collection(name: string) {
  const store = () => {
    if (!stores.has(name)) stores.set(name, new Map())
    return stores.get(name) as Map<string, StoredDocument>
  }
  return {
    async findOne(filter: Filter) {
      return structuredClone(
        [...store().values()].find((doc) => matches(doc, filter)) ?? null
      )
    },
    async insertOne(
      document: StoredDocument,
      _options: { upsert?: boolean } = {}
    ) {
      if (name === "household_tasks" && failTaskInsert)
        throw new Error("Simulated parent write failure")
      if (
        store().has(document._id) ||
        (name === "household_task_occurrences" &&
          [...store().values()].some(
            (doc) =>
              doc.taskId === document.taskId && doc.date === document.date
          ))
      )
        throw new MongoServerError({ code: 11000, message: "Duplicate" })
      store().set(document._id, structuredClone(document))
    },
    async updateOne(
      filter: Filter,
      update: Record<string, Record<string, unknown>>,
      options: { upsert?: boolean } = {}
    ) {
      const document = [...store().values()].find((doc) => matches(doc, filter))
      if (!document) {
        if (options.upsert) {
          await this.insertOne({
            _id: String(filter._id),
            ...update.$setOnInsert,
          })
          return { matchedCount: 0, upsertedCount: 1 }
        }
        return { matchedCount: 0 }
      }
      const next = { ...document, ...update.$set }
      for (const [key, increment] of Object.entries(update.$inc ?? {}))
        next[key] = Number(next[key]) + Number(increment)
      for (const key of Object.keys(update.$unset ?? {})) delete next[key]
      if (
        name === "household_task_occurrences" &&
        [...store().values()].some(
          (doc) =>
            doc._id !== next._id &&
            doc.taskId === next.taskId &&
            doc.date === next.date
        )
      )
        throw new MongoServerError({ code: 11000, message: "Duplicate" })
      store().set(next._id, next)
      return { matchedCount: 1 }
    },
    async deleteOne(filter: Filter) {
      const document = [...store().values()].find((doc) => matches(doc, filter))
      if (document) store().delete(document._id)
      return { deletedCount: document ? 1 : 0 }
    },
    async deleteMany(filter: Filter) {
      if (failPendingCleanup) throw new Error("Simulated cleanup failure")
      for (const doc of store().values())
        if (matches(doc, filter)) store().delete(doc._id)
    },
    find() {
      const cursor = {
        sort: () => cursor,
        collation: () => cursor,
        toArray: async () =>
          [...store().values()].map((doc) => structuredClone(doc)),
      }
      return cursor
    },
  }
}
mock.module("@/lib/db/collections", () => ({
  COLLECTION_NAMES: {
    householdTasks: "household_tasks",
    householdTaskOccurrences: "household_task_occurrences",
  },
  getCollection: async (name: string) => collection(name),
}))
const {
  mutateHouseholdTask: mutate,
  loadHouseholdTasks,
  HouseholdTaskConflict,
} = await import("./household-tasks")

const taskId = "93a8bcc4-47a1-4466-ab01-c0860c595dd2"
const occurrenceId = "758ab084-3523-40f0-9a32-2a55cdbf44e3"
const secondId = "29d64388-67de-41d0-9521-ea08d0ebbe87"
const create: HouseholdTaskCommand = {
  kind: "create",
  taskId,
  name: "Sheets",
  intervalDays: 7,
}
const schedule: HouseholdTaskCommand = {
  kind: "schedule",
  taskId,
  occurrenceId,
  date: "2026-11-02",
}

beforeEach(() => {
  stores.clear()
  failTaskInsert = false
  failPendingCleanup = false
})

describe("household task repository with conditional document store", () => {
  it("creates tasks and initial history idempotently without leaking persistence fields", async () => {
    await mutate({ ...create, initialDate: "2026-10-30" })
    await mutate({ ...create, initialDate: "2026-10-30" })
    const data = await loadHouseholdTasks()
    expect(data.tasks).toEqual([
      { id: taskId, name: "Sheets", intervalDays: 7, archived: false },
    ])
    expect(data.occurrences).toEqual([
      {
        id: taskId,
        taskId,
        date: "2026-10-30",
        completedDate: "2026-10-30",
        wasScheduled: false,
      },
    ])
  })
  it("hides incomplete creation history and resumes safely after a parent write failure", async () => {
    failTaskInsert = true
    await expect(
      mutate({ ...create, initialDate: "2026-10-30" })
    ).rejects.toThrow("Simulated parent write failure")
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(0)
    failTaskInsert = false
    await mutate({ ...create, initialDate: "2026-10-30" })
    expect((await loadHouseholdTasks()).tasks).toHaveLength(1)
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(1)
  })
  it("hides archived pending entries during failed cleanup and finishes cleanup on retry", async () => {
    await mutate(create)
    await mutate(schedule)
    failPendingCleanup = true
    await expect(mutate({ kind: "archive", taskId })).rejects.toThrow(
      "Simulated cleanup failure"
    )
    const data = await loadHouseholdTasks()
    expect(data.tasks[0].archived).toBe(true)
    expect(data.occurrences).toHaveLength(0)
    failPendingCleanup = false
    await mutate({ kind: "archive", taskId })
    expect(stores.get("household_task_occurrences")?.size).toBe(0)
  })
  it("schedules, completes and retries without duplicate occurrences", async () => {
    await mutate(create)
    await mutate(schedule)
    await mutate({ ...schedule, occurrenceId: secondId })
    await mutate({
      kind: "complete",
      taskId,
      occurrenceId,
      completedDate: "2026-11-01",
    })
    await mutate({
      kind: "complete",
      taskId,
      occurrenceId,
      completedDate: "2026-11-01",
    })
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(1)
    expect((await loadHouseholdTasks()).occurrences[0]).toMatchObject({
      date: "2026-11-02",
      completedDate: "2026-11-01",
    })
    await expect(
      mutate({
        kind: "complete",
        taskId,
        occurrenceId,
        completedDate: "2026-11-02",
      })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
  })
  it("moves pending dates, rejects stale moves and preserves dates after duplicate moves", async () => {
    await mutate(create)
    await mutate(schedule)
    await mutate({ ...schedule, occurrenceId: secondId, date: "2026-11-03" })
    await expect(
      mutate({
        kind: "move",
        taskId,
        occurrenceId,
        expectedDate: "2026-11-02",
        date: "2026-11-03",
      })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
    expect(
      (await loadHouseholdTasks()).occurrences.find(
        (entry) => entry.id === occurrenceId
      )?.date
    ).toBe("2026-11-02")
    await mutate({
      kind: "move",
      taskId,
      occurrenceId,
      expectedDate: "2026-11-02",
      date: "2026-11-04",
    })
    await expect(
      mutate({
        kind: "move",
        taskId,
        occurrenceId,
        expectedDate: "2026-11-02",
        date: "2026-11-05",
      })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
  })
  it("corrects execution dates and restores scheduled entries to pending on deletion", async () => {
    await mutate(create)
    await mutate(schedule)
    await mutate({
      kind: "complete",
      taskId,
      occurrenceId,
      completedDate: "2026-11-02",
    })
    await mutate({
      kind: "edit-execution",
      taskId,
      occurrenceId,
      expectedCompletedDate: "2026-11-02",
      completedDate: "2026-11-01",
    })
    await expect(
      mutate({
        kind: "delete-execution",
        taskId,
        occurrenceId,
        expectedCompletedDate: "2026-11-02",
      })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
    await mutate({
      kind: "delete-execution",
      taskId,
      occurrenceId,
      expectedCompletedDate: "2026-11-01",
    })
    await mutate({
      kind: "delete-execution",
      taskId,
      occurrenceId,
      expectedCompletedDate: "2026-11-01",
    })
    expect(
      (await loadHouseholdTasks()).occurrences[0].completedDate
    ).toBeUndefined()
    await mutate({ kind: "cancel", taskId, occurrenceId })
    await mutate({ kind: "cancel", taskId, occurrenceId })
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(0)
  })
  it("records and deletes unplanned executions", async () => {
    await mutate(create)
    const record: HouseholdTaskCommand = {
      kind: "record",
      taskId,
      occurrenceId,
      completedDate: "2026-11-01",
    }
    await mutate(record)
    await mutate(record)
    await expect(
      mutate({ ...record, occurrenceId: secondId })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
    await mutate({
      kind: "edit-execution",
      taskId,
      occurrenceId,
      expectedCompletedDate: "2026-11-01",
      completedDate: "2026-10-31",
    })
    expect((await loadHouseholdTasks()).occurrences[0].date).toBe("2026-10-31")
    await mutate({
      kind: "delete-execution",
      taskId,
      occurrenceId,
      expectedCompletedDate: "2026-10-31",
    })
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(0)
  })
  it("archives idempotently, removes pending dates and preserves completed history", async () => {
    await mutate(create)
    await mutate(schedule)
    await mutate({
      kind: "record",
      taskId,
      occurrenceId: secondId,
      completedDate: "2026-11-01",
    })
    await mutate({ kind: "archive", taskId })
    await mutate({ kind: "archive", taskId })
    const data = await loadHouseholdTasks()
    expect(data.tasks[0].archived).toBe(true)
    expect(data.occurrences).toHaveLength(1)
    await expect(mutate(schedule)).rejects.toBeInstanceOf(HouseholdTaskConflict)
    await mutate({
      kind: "edit-execution",
      taskId,
      occurrenceId: secondId,
      expectedCompletedDate: "2026-11-01",
      completedDate: "2026-10-31",
    })
    await mutate({
      kind: "delete-execution",
      taskId,
      occurrenceId: secondId,
      expectedCompletedDate: "2026-10-31",
    })
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(0)
  })
  it("restores archived tasks idempotently", async () => {
    await mutate(create)
    await mutate({ kind: "archive", taskId })
    await mutate({ kind: "restore", taskId })
    await mutate({ kind: "restore", taskId })
    expect((await loadHouseholdTasks()).tasks[0].archived).toBe(false)
    await mutate(schedule)
    expect((await loadHouseholdTasks()).occurrences).toHaveLength(1)
  })
  it("rejects unknown tasks and cross-task occurrence references", async () => {
    await expect(mutate(schedule)).rejects.toBeInstanceOf(HouseholdTaskConflict)
    await mutate(create)
    await mutate(schedule)
    await mutate({ ...create, taskId: secondId })
    await expect(
      mutate({
        kind: "complete",
        taskId: secondId,
        occurrenceId,
        completedDate: "2026-11-02",
      })
    ).rejects.toBeInstanceOf(HouseholdTaskConflict)
  })
})
