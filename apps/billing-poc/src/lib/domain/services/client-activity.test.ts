import { expect, test as it } from "bun:test"
import type { Client } from "../entities/client"
import type { Commission } from "../entities/commission"
import type { Payment } from "../entities/payment"
import { loadClientActivity } from "./client-activity"

const client: Client = {
  _id: "client-a",
  name: "Client A",
  clientType: "individual",
  createdAt: new Date(),
  updatedAt: new Date(),
}
const payments = [
  { _id: "old", clientId: "client-a", date: "2020-01-01" },
  { _id: "recent", clientId: "client-a", date: "2026-11-01" },
  { _id: "other", clientId: "client-b", date: "2026-11-01" },
] as Payment[]
const commissions = [
  { _id: "paid", clientId: "client-a", paymentId: "old" },
  { _id: "unpaid", clientId: "client-a" },
  { _id: "other", clientId: "client-b" },
] as Commission[]

it("loads the client's entire history and paid/unpaid work through scoped repositories", async () => {
  const calls: unknown[] = []
  const result = await loadClientActivity("client-a", {
    clients: {
      findById: async (id) => {
        calls.push(id)
        return client
      },
    },
    payments: {
      findAll: async (filter) => {
        calls.push(filter)
        return payments.filter((p) => p.clientId === filter.clientId)
      },
    },
    commissions: {
      findAll: async (id) => {
        calls.push(["commissions", id])
        return commissions.filter((c) => c.clientId === id)
      },
    },
    firings: {
      findAll: async (id) => {
        calls.push(["firings", id])
        return commissions.filter((c) => c.clientId === id)
      },
    },
  })
  expect(calls).toEqual([
    "client-a",
    { clientId: "client-a" },
    ["commissions", "client-a"],
    ["firings", "client-a"],
  ])
  expect(result?.payments.map((p) => p._id)).toEqual(["old", "recent"])
  expect(result?.commissions.map((c) => c._id)).toEqual(["paid", "unpaid"])
  expect(result?.firings.map((c) => c._id)).toEqual(["paid", "unpaid"])
  expect(result?.client).toBe(client)
})

it("missing clients do not trigger any activity queries", async () => {
  const unexpected = async (): Promise<never> => {
    throw new Error("Unexpected activity query")
  }
  expect(
    await loadClientActivity("missing", {
      clients: { findById: async () => null },
      payments: { findAll: unexpected },
      commissions: { findAll: unexpected },
      firings: { findAll: unexpected },
    })
  ).toBeNull()
})

it("repository failures reject the whole activity instead of showing partial totals", async () => {
  const failure = new Error("Unavailable")
  await expect(
    loadClientActivity("client-a", {
      clients: { findById: async () => client },
      payments: {
        findAll: async () => {
          throw failure
        },
      },
      commissions: { findAll: async () => [] },
      firings: { findAll: async () => [] },
    })
  ).rejects.toBe(failure)
})
