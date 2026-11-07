import { expect, test as it } from "bun:test"
import { NextResponse } from "next/server"
import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"
import type { FiscalTaskRepository } from "@/lib/domain/ports/fiscal-task-repository"
import { createFiscalAgendaHandlers } from "./handlers"

function setup() {
  const records = new Map<string, FiscalTask>()
  const key = (owner: string, id: string) => `${owner}:${id}`
  let owner = "owner-a"
  const repository: FiscalTaskRepository = {
    list: async (user, year) =>
      [...records]
        .filter(
          ([id, task]) => id.startsWith(`${user}:`) && task.dueYear === year
        )
        .map(([, task]) => task),
    incorporate: async (user, task) => {
      const id = key(user, task.id)
      if (!records.has(id)) records.set(id, task)
    },
    create: async (user, task) => {
      records.set(key(user, task.id), task)
    },
    find: async (user, id) => records.get(key(user, id)) ?? null,
    replace: async (user, previous, task) => {
      const id = key(user, task.id)
      if (records.get(id) !== previous) return false
      records.set(id, task)
      return true
    },
    remove: async (user, id) => records.delete(key(user, id)),
  }
  return {
    handlers: createFiscalAgendaHandlers({
      authorize: async () =>
        owner ? null : NextResponse.json({}, { status: 401 }),
      getOwner: async () => owner,
      repository,
    }),
    repository,
    as: (user: string) => {
      owner = user
    },
  }
}

const url = "http://localhost/api/fiscal-agenda"
const officialId = "official-303-2025-4T"
const list = () => new Request(`${url}?year=2026`)
const request = (method: string, data: unknown) =>
  new Request(url, { method, body: JSON.stringify(data) })

it("does not duplicate official tasks or leak them across accounts", async () => {
  const { handlers, as } = setup()
  const selection = { action: "incorporate", year: 2026, ids: [officialId] }
  expect((await handlers.POST(request("POST", selection))).status).toBe(201)
  expect((await handlers.POST(request("POST", selection))).status).toBe(201)
  expect((await (await handlers.GET(list())).json()).tasks).toHaveLength(1)
  as("owner-b")
  expect((await (await handlers.GET(list())).json()).tasks).toEqual([])
  expect(
    (
      await handlers.PUT(
        request("PUT", { action: "progress", id: officialId, progress: {} })
      )
    ).status
  ).toBe(404)
  expect(
    (
      await handlers.DELETE(
        new Request(`${url}?id=${officialId}`, { method: "DELETE" })
      )
    ).status
  ).toBe(404)
  as("")
  expect((await handlers.GET(list())).status).toBe(401)
})

it("refreshes only pending catalog entries and retains notes", async () => {
  const { handlers, repository } = setup()
  await repository.create("owner-a", {
    id: officialId,
    model: "303",
    period: "4T",
    title: "Modelo 303",
    dueYear: 2026,
    filingDue: "2026-01-29",
    source: "https://example.com",
    notes: "Keep this",
  })
  const refresh = { action: "refresh", id: officialId }
  expect((await handlers.PUT(request("PUT", refresh))).status).toBe(200)
  expect(await repository.find("owner-a", officialId)).toMatchObject({
    filingDue: "2026-01-30",
    notes: "Keep this",
  })
  expect(
    (
      await handlers.PUT(
        request("PUT", {
          action: "progress",
          id: officialId,
          progress: { filedOn: "2026-01-29", paidOn: "2026-01-30" },
        })
      )
    ).status
  ).toBe(200)
  expect((await handlers.PUT(request("PUT", refresh))).status).toBe(409)
})

it("accepts manual tasks without a catalog and rejects invalid deadlines", async () => {
  const { handlers } = setup()
  const task = {
    title: "Compra de local",
    model: "600",
    period: "",
    paymentDue: "2027-02-28",
  }
  expect(
    (await handlers.POST(request("POST", { action: "manual", task }))).status
  ).toBe(201)
  expect(
    await (await handlers.GET(new Request(`${url}?year=2027`))).json()
  ).toMatchObject({
    hasCatalog: false,
    suggestions: [],
    tasks: [{ ...task, dueYear: 2027 }],
  })
  expect(
    (
      await handlers.POST(
        request("POST", {
          action: "manual",
          task: { ...task, paymentDue: "2027-02-29" },
        })
      )
    ).status
  ).toBe(400)
})
