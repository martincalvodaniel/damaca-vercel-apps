import { expect, test as it } from "bun:test"
import { type Commission, partitionCommissions } from "./commission"

const base: Commission = {
  title: "Work",
  prepaidAmount: 0,
  concepts: [],
  vat: 21,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
}
it("groups only by a generated payment link and sorts both groups by deadline", () => {
  const items: Commission[] = [
    { ...base, _id: "paid-undated", paymentId: "p1" },
    { ...base, _id: "prepaid", prepaidAmount: 25.5, dueDate: "2026-11-12" },
    { ...base, _id: "paid-dated", paymentId: "p2", dueDate: "2026-11-01" },
    {
      ...base,
      _id: "pending",
      paymentGeneration: {
        paymentId: "reserved",
        date: "2026-11-01",
        paymentMethod: "cash",
      },
      dueDate: "2026-11-02",
    },
    { ...base, _id: "undated" },
  ]
  const groups = partitionCommissions(items)
  expect(groups.withPayment.map((item) => item._id)).toEqual([
    "paid-dated",
    "paid-undated",
  ])
  expect(groups.withoutPayment.map((item) => item._id)).toEqual([
    "pending",
    "prepaid",
    "undated",
  ])
  expect(items[0]?._id).toBe("paid-undated")
})
it("moves a commission between groups when its payment is linked or deleted", () => {
  expect(
    partitionCommissions([{ ...base, paymentId: "p1" }]).withPayment
  ).toHaveLength(1)
  expect(
    partitionCommissions([{ ...base, paymentId: undefined }]).withoutPayment
  ).toHaveLength(1)
})
