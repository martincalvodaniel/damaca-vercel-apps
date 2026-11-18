import { expect, test as it } from "bun:test"
import { diagnosePersonalQueue } from "@/lib/sync/personal-queue-diagnostics"
import { summarizeSyncQueueV2 } from "@/lib/sync/queue-summary-v2"
import { buildSyncDiagnosticReport } from "@/lib/sync/sync-diagnostic-report"
import { taskPlacementEntityKey } from "@/schemas/ordering"
import { syncQueueSummaryV2Schema } from "@/schemas/sync-queue-v2"
import type { OutboxEntry } from "@/types/local-sync"
import type { SyncCommand } from "@/types/sync"

const userId = "mixed-summary-owner"
const timestamp = "2026-10-09T00:00:00.000Z"
function entry(
  sequence: number,
  command: SyncCommand,
  dependencies: OutboxEntry[] = [],
  state: OutboxEntry["state"] = "pending"
): OutboxEntry {
  const entityKey =
    command.type === "task.move"
      ? taskPlacementEntityKey(
          command.occurrenceId ?? command.itemId,
          command.scope,
          command.date
        )
      : command.type === "item-view.set"
        ? `item-view:${command.itemId}`
        : "tagId" in command
          ? `tag:${command.tagId}`
          : "itemId" in command
            ? `item:${command.itemId}`
            : ""
  return {
    userId,
    entityKey,
    sequence,
    state,
    dependencies: dependencies.map((entry) => entry.operation.operationId),
    attempts: state === "sending" ? 1 : 0,
    createdAt: timestamp,
    lease:
      state === "sending"
        ? { ownerId: crypto.randomUUID(), expiresAt: timestamp }
        : null,
    operation: {
      operationId: crypto.randomUUID(),
      protocolVersion: 1,
      baseRevision: 0,
      command,
    },
  }
}
function tag(
  sequence: number,
  dependencies: OutboxEntry[] = [],
  state: OutboxEntry["state"] = "pending"
) {
  return entry(
    sequence,
    { type: "tag.delete", tagId: crypto.randomUUID() },
    dependencies,
    state
  )
}
function summary(entries: OutboxEntry[]) {
  return summarizeSyncQueueV2({ userId, entries, items: [] })
}

it("a historical move blocks personal descendants while independent content remains ready", () => {
  const move = entry(1, {
    type: "task.move",
    itemId: crypto.randomUUID(),
    occurrenceId: null,
    scope: "overdue",
    date: "2026-10-09",
    tagId: null,
    beforeId: null,
    afterId: null,
  })
  const dependent = tag(2, [move])
  const content = entry(3, { type: "item.delete", itemId: crypto.randomUUID() })
  const input = [move, dependent, content],
    before = structuredClone(input)
  expect(summary(input)).toEqual({
    pending: 3,
    ready: 1,
    waiting: 0,
    blocked: 1,
    unsupported: 1,
    sending: 0,
    conflicts: 0,
    rejected: 0,
    personalUnresolved: 2,
    personalProjectionBlocked: true,
  })
  expect(input).toEqual(before)
})

it("acknowledged parents unblock children, while superseded parents do not masquerade as ACKs", () => {
  const parent = tag(1, [], "acknowledged"),
    child = tag(2, [parent])
  expect(summary([parent, child])).toMatchObject({
    pending: 1,
    ready: 1,
    blocked: 0,
    personalUnresolved: 1,
    personalProjectionBlocked: true,
  })
  parent.state = "superseded"
  expect(summary([parent])).toMatchObject({
    pending: 0,
    personalUnresolved: 0,
    personalProjectionBlocked: false,
  })
  expect(summary([parent, child])).toMatchObject({
    ready: 0,
    blocked: 1,
    personalUnresolved: 1,
    personalProjectionBlocked: true,
  })
  parent.state = "pending"
  expect(summary([parent, child])).toMatchObject({
    ready: 1,
    waiting: 1,
    personalUnresolved: 2,
  })
})

it("personal sending, conflicts and rejections remain unresolved without being double-counted as pending", () => {
  const entries = [
    tag(1, [], "sending"),
    tag(2, [], "conflict"),
    tag(3, [], "rejected"),
    tag(4, [], "acknowledged"),
  ]
  expect(summary(entries)).toEqual({
    pending: 0,
    ready: 0,
    waiting: 0,
    blocked: 0,
    unsupported: 0,
    sending: 1,
    conflicts: 1,
    rejected: 1,
    personalUnresolved: 3,
    personalProjectionBlocked: true,
  })
  expect(summary([])).toMatchObject({
    pending: 0,
    personalUnresolved: 0,
    personalProjectionBlocked: false,
  })
})

it("complete graph and summary consistency are validated before returning any counts", () => {
  const parent = tag(1),
    child = tag(2, [parent])
  expect(() => summary([child])).toThrow()
  expect(() => summary([parent, { ...child, userId: "foreign" }])).toThrow()
  expect(() => summary([parent, { ...child, sequence: 1 }])).toThrow()
  const value = summary([parent, child])
  for (const invalid of [
    { ...value, personalProjectionBlocked: false },
    { ...value, personalUnresolved: 3 },
    { ...value, ready: 2 },
    { ...value, extra: true },
  ])
    expect(() => syncQueueSummaryV2Schema.parse(invalid)).toThrow()
  value.pending = 100
  expect(summary([parent, child]).pending).toBe(2)
})

it("diagnostic copies only public fields and counts unique unresolved descendants per blocker", () => {
  const planId = crypto.randomUUID()
  const move = entry(
    1,
    {
      type: "task.move",
      itemId: planId,
      occurrenceId: null,
      scope: "overdue",
      date: "2026-10-09",
      tagId: null,
      beforeId: null,
      afterId: null,
    },
    [],
    "conflict"
  )
  move.operation.baseRevision = 7
  const left = tag(2, [move])
  const right = entry(3, { type: "item.delete", itemId: planId }, [move])
  const shared = tag(4, [left, right])
  const history = tag(5, [move], "acknowledged")
  const independent = tag(6, [history])
  const retired = tag(7, [move], "superseded")
  const otherRoot = tag(8, [], "rejected")
  const both = tag(9, [shared, otherRoot])
  const sending = tag(10, [], "sending")
  const entries = [
    both,
    move,
    sending,
    left,
    otherRoot,
    right,
    retired,
    shared,
    history,
    independent,
  ]
  const before = structuredClone(entries)
  const diagnostics = diagnosePersonalQueue({ userId, entries, items: [] })
  const report = buildSyncDiagnosticReport(diagnostics, {
    appVersion: "0.1.0",
    protocol: 6,
    busy: false,
    result: {
      status: "settled",
      phase: "queue",
      uploaded: 1,
      downloaded: 2,
      diagnostics,
    },
  })
  expect(report.roots).toEqual([
    { id: 1, type: "task.move", blockedChanges: 4 },
    { id: 8, type: "tag.delete", blockedChanges: 1 },
  ])
  expect(report.queue[0]).toEqual({
    id: 1,
    entity: 1,
    plan: 2,
    type: "task.move",
    state: "conflict",
    category: "blocked",
    baseRevision: 7,
    attempts: 0,
    dependencies: [],
  })
  expect(report.queue[2].plan).toBe(report.queue[0].plan)
  expect(report.queue[5].category).toBe("ready")
  expect(report.queue[8].dependencies).toEqual([4, 8])
  expect(report.lastAttempt).toEqual({
    phase: "queue",
    status: "settled",
    uploaded: 1,
    downloaded: 2,
  })
  const json = JSON.stringify(report)
  for (const secret of [
    userId,
    planId,
    timestamp,
    "2026-10-09",
    move.entityKey,
    sending.lease?.ownerId,
    ...entries.map(({ operation }) => operation.operationId),
  ]) {
    expect(json).not.toContain(secret ?? "missing fixture lease")
  }
  expect(json).not.toContain('"command"')
  expect(entries).toEqual(before)
})
