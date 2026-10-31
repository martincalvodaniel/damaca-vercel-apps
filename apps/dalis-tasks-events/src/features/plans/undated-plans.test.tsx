import { expect, test as it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { selectAgendaPlans } from "@/features/plans/agenda-selection"
import { PlanCard } from "@/features/plans/components/plan-card"
import { PlanForm } from "@/features/plans/components/plan-form"
import { PlanList } from "@/features/plans/components/plan-list"
import {
  createPlanAgendaRows,
  groupPlanAgendaRows,
  orderPlanAgendaRows,
  planAppearanceRange,
} from "@/features/plans/plan-agenda-rows"
import { parsePlanForm } from "@/features/plans/plan-form-input"
import {
  planRowCategoryDropGroups,
  planRowMoveCommand,
  planRowOrderPeers,
} from "@/features/plans/plan-order-selection"
import { PlacementScopeLabel } from "@/features/sync/components/placement-scope-label"
import { rescheduledPlanInput } from "@/lib/calendar/plan-reschedule"
import { planLocalPlanMove } from "@/lib/local-db/plan-move-mutation"
import { planRemoteRecurringTaskPlacementOperation } from "@/lib/preferences/remote-recurring-task-placement-plan"
import { planRemoteTaskPlacementOperation } from "@/lib/preferences/remote-task-placement-plan"
import { calendarItemSchema } from "@/schemas/calendar-item"
import {
  taskPlacementEntityKey,
  taskPlacementEntityKeySchema,
} from "@/schemas/ordering"
import { planInputSchema } from "@/schemas/plan-input"
import { planSchema } from "@/schemas/plan-item"
import type { PlanVariant } from "@/types/plan-item"

const owner = "undated-owner"
const now = "2026-10-31T12:00:00.000Z"
const save = async () => undefined
const cancel = () => undefined
const selection = { kind: "undated" } as const
function plan(variant: PlanVariant = "task") {
  return planSchema.parse({
    id: crypto.randomUUID(),
    ownerId: owner,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    kind: "plan",
    variant,
    title: "Undated plan",
    description: "Retained details",
    schedule: null,
    recurrence: null,
    status: "in_progress",
    completedAt: null,
    checklist: [
      { id: crypto.randomUUID(), text: "Existing step", completed: true },
    ],
  })
}

it("all variants save without date fields and can acquire or remove a date without losing progress", () => {
  for (const variant of ["task", "event", "appointment", "note"] as const) {
    const source = plan(variant)
    const fields = new FormData()
    for (const [name, value] of Object.entries({
      variant,
      title: source.title,
      description: source.description,
      status: source.status,
      undated: "on",
    }))
      fields.set(name, value)
    const parsed = parsePlanForm(fields, source.checklist)
    expect(parsed.success).toBe(true)
    if (!parsed.success) throw parsed.error
    expect(parsed.data).toMatchObject({
      schedule: null,
      recurrence: null,
      checklist: source.checklist,
    })
    expect(calendarItemSchema.parse(source)).toEqual(source)
    const dated = rescheduledPlanInput(source, "2026-11-02")
    expect(dated.schedule).toEqual({
      mode: "all_day",
      startDate: "2026-11-02",
      endDateExclusive: "2026-11-03",
    })
    expect(planInputSchema.parse({ ...dated, schedule: null })).toEqual(
      parsed.data
    )
    expect(
      planSchema.safeParse({
        ...source,
        recurrence: {
          frequency: "daily",
          interval: 1,
          anchorDate: "2026-10-31",
          timeZone: "Europe/Madrid",
          end: { type: "never" },
        },
      }).success
    ).toBe(false)
  }
})

it("undated plans stay out of civil agenda selections and appearance generation, including completed plans", () => {
  const source = plan()
  const done = {
    ...plan("note"),
    status: "completed" as const,
    completedAt: now,
  }
  const dated = {
    ...source,
    ...rescheduledPlanInput(source, "2026-10-30"),
    id: crypto.randomUUID(),
  }
  const items = [source, done, dated, { ...plan(), deletedAt: now }]
  expect(
    selectAgendaPlans(items, selection)
      .map((item) => item.id)
      .sort()
  ).toEqual([source.id, done.id].sort())
  for (const kind of ["day", "overdue", "upcoming"] as const)
    expect(
      selectAgendaPlans(items, { kind, date: "2026-10-31" }).some(
        (item) => !item.schedule
      )
    ).toBe(false)
  expect(createPlanAgendaRows(items, [], selection)).toHaveLength(2)
  expect(planAppearanceRange(items, [], selection, "2026-11-30")).toBeNull()
})

it("undated order survives local optimism and both remote planners with an independent durable scope", () => {
  const first = plan("task"),
    last = plan("note")
  const items = [first, last]
  const rows = createPlanAgendaRows(items, [], selection)
  const target = rows.find((row) => row.key === last.id)
  if (!target) throw new Error("Missing fixture row")
  expect(planRowOrderPeers(rows, selection, target)).toHaveLength(2)
  const command = planRowMoveCommand(selection, target, null, {
    beforeId: first.id,
    afterId: null,
  })
  expect(command.scope).toBe("undated")
  const key = taskPlacementEntityKey(last.id, command.scope, command.date)
  expect(taskPlacementEntityKeySchema.parse(key)).toBe(key)
  expect(key).not.toBe(taskPlacementEntityKey(last.id, "overdue", command.date))
  const snapshot = {
    items,
    tags: [],
    views: [],
    placements: [],
    settings: null,
  }
  const local = planLocalPlanMove(snapshot, command, owner, now)
  const roundTrip = JSON.parse(JSON.stringify(local.placements))
  expect(
    orderPlanAgendaRows(rows, roundTrip, selection, null).map((row) => row.key)
  ).toEqual([last.id, first.id])
  const input = {
    userId: owner,
    timestamp: now,
    ...snapshot,
    operation: {
      operationId: crypto.randomUUID(),
      protocolVersion: 1,
      baseRevision: 0,
      command,
    },
  }
  const { settings: _settings, ...remoteInput } = input
  expect(planRemoteTaskPlacementOperation(remoteInput, true).status).toBe(
    "changes"
  )
  const recurringInput = { ...remoteInput, occurrences: [] }
  expect(planRemoteRecurringTaskPlacementOperation(recurringInput).status).toBe(
    "changes"
  )
  const stale = {
    ...remoteInput,
    items: [first, { ...last, ...rescheduledPlanInput(last, "2026-10-31") }],
  }
  expect(planRemoteTaskPlacementOperation(stale, true).status).toBe(
    "invalid_command"
  )
})

it("undated editor and card expose Spanish date state without fabricated calendar dates", () => {
  const source = plan()
  const card = renderToStaticMarkup(<PlanCard plan={source} />)
  expect(card).toContain("Sin fecha")
  expect(card).not.toContain("<time")
  expect(card).toContain("Existing step")
  const form = renderToStaticMarkup(
    <PlanForm
      scheduledDate="2026-10-31"
      timeZone="Europe/Madrid"
      initialPlan={source}
      tags={[]}
      onSave={save}
      onCancel={cancel}
    />
  )
  expect(form).toMatch(/name="undated"[^>]*checked=""/)
  expect(form).toMatch(/<fieldset[^>]*hidden=""[^>]*disabled=""/)
  expect(form).toContain("Retained details")
})

it("undated section mounts collapsed and other sections retain their expanded default", () => {
  const account = {
    userId: owner,
    epoch: "test",
    itemCount: 0,
    offlineReady: false,
  }
  const closed = renderToStaticMarkup(
    <PlanList
      account={account}
      selection={selection}
      heading="Sin fecha"
      collapsible
      defaultCollapsed
    />
  )
  expect(closed).toContain('aria-label="Sin fecha"')
  expect(closed).toContain('aria-expanded="false"')
  expect(closed).toMatch(/<div[^>]*hidden=""/)
  const open = renderToStaticMarkup(
    <PlanList
      account={account}
      selection={{ kind: "overdue", date: "2026-10-31" }}
      heading="Atrasadas"
      collapsible
    />
  )
  expect(open).toContain('aria-expanded="true"')
})

it("undated plans can move to an empty category through the existing atomic movement", () => {
  const source = plan()
  const tag = {
    id: crypto.randomUUID(),
    userId: owner,
    name: "Personal",
    normalizedName: "personal",
    color: "#123abc",
    position: 0,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  const rows = createPlanAgendaRows([source], [], selection)
  const groups = groupPlanAgendaRows(rows, [tag], [], true)
  const targets = planRowCategoryDropGroups(groups, selection, rows[0], [])
  expect(groups.find((group) => group.id === tag.id)?.rows).toEqual([])
  expect(targets.find((group) => group.id === tag.id)?.peers).toEqual([
    source.id,
  ])
  const command = planRowMoveCommand(selection, rows[0], tag.id, {
    beforeId: null,
    afterId: null,
  })
  const result = planLocalPlanMove(
    { items: [source], tags: [tag], views: [], placements: [], settings: null },
    command,
    owner,
    now
  )
  expect(result.view?.primaryTagId).toBe(tag.id)
  expect(result.placements[0]).toMatchObject({
    scope: "undated",
    tagId: tag.id,
    occurrenceId: source.id,
  })
  expect(source.schedule).toBeNull()
  expect(source.status).toBe("in_progress")
  expect(
    renderToStaticMarkup(
      <PlacementScopeLabel scope="undated" date="0001-01-01" />
    )
  ).toBe("Sin fecha")
})
