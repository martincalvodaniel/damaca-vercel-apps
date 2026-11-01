import { expect, test as it } from "bun:test"
import { ObjectId } from "mongodb"
import {
  type Commission,
  sortCommissions,
} from "@/lib/domain/entities/commission"
import type { MongoCommission } from "../types"
import {
  buildCommissionUpdate,
  commissionToDomain,
  commissionToMongo,
} from "./mongo-commission-repository-helpers"

const base: Commission = {
  title: "Work",
  concepts: [],
  vat: 21,
  prepaidAmount: 0,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}

it("orders by deadline, places undated last, then newest creation and ID without mutating input", () => {
  const items = [
    { ...base, _id: "undated" },
    { ...base, _id: "later", dueDate: "2026-05-02" },
    { ...base, _id: "b", dueDate: "2026-05-01" },
    { ...base, _id: "a", dueDate: "2026-05-01" },
    {
      ...base,
      _id: "newer",
      dueDate: "2026-05-01",
      createdAt: new Date("2026-02-01"),
    },
  ]
  expect(sortCommissions(items).map((item) => item._id)).toEqual([
    "newer",
    "a",
    "b",
    "later",
    "undated",
  ])
  expect(items[0]?._id).toBe("undated")
})
it("omits optional nullish fields and converts all references at the boundary", () => {
  const clientId = new ObjectId().toString()
  const paymentId = new ObjectId().toString()
  const doc = commissionToMongo({
    ...base,
    clientId,
    paymentGeneration: { paymentId, date: "2026-01-01", paymentMethod: "card" },
    concepts: [{ name: "Work", amount: 12, quantity: 1, productId: undefined }],
  })
  expect(doc.clientId).toBeInstanceOf(ObjectId)
  expect(doc.paymentGeneration?.paymentId).toBeInstanceOf(ObjectId)
  expect(Object.hasOwn(doc, "paymentId")).toBe(false)
  expect(Object.hasOwn(doc.concepts[0] ?? {}, "productId")).toBe(false)
  expect(commissionToDomain(doc)).toMatchObject({
    clientId,
    paymentGeneration: { paymentId },
  })
})
it("unsets optional fields but preserves legitimate zero values", () => {
  const ops = buildCommissionUpdate({
    clientId: undefined,
    description: "",
    dueDate: undefined,
    prepaidAmount: 0,
    vat: 0,
  })
  expect(ops.$unset).toEqual({
    paymentStatus: true,
    clientId: true,
    description: true,
    dueDate: true,
  })
  expect(ops.$set).toMatchObject({ prepaidAmount: 0, vat: 0 })
  expect(buildCommissionUpdate({ title: "Work" }).$unset).toEqual({
    paymentStatus: true,
  })
})

it("defaults absent prepaid amounts to zero without converting or exposing the obsolete percentage", () => {
  const { prepaidAmount: _prepaid, ...doc } = commissionToMongo(base)
  const result = commissionToDomain({
    ...doc,
    paymentStatus: 50,
  } as MongoCommission)
  expect(result.prepaidAmount).toBe(0)
  expect(Object.hasOwn(result, "paymentStatus")).toBe(false)
  expect(
    commissionToDomain(commissionToMongo({ ...base, prepaidAmount: 12.34 }))
      .prepaidAmount
  ).toBe(12.34)
})
