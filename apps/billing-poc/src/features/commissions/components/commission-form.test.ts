import { expect, test as it } from "bun:test"
import type { Commission } from "@/lib/domain/entities/commission"
import { buildCommissionPatch, buildProductConcept } from "./commission-form"

const original: Commission = {
  title: "Work",
  clientId: "client-1",
  description: "Details",
  dueDate: "2026-11-01",
  vat: 21,
  concepts: [{ name: "Cup", amount: 25, quantity: 1 }],
  paymentStatus: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

it("a manual progress change sends only the status and never re-synchronizes payment fields", () => {
  expect(
    buildCommissionPatch(original, { ...original, paymentStatus: 50 })
  ).toEqual({ paymentStatus: 50 })
})
it("optional field removal survives JSON serialization to reach the server", () => {
  const patch = buildCommissionPatch(original, {
    ...original,
    clientId: undefined,
    description: undefined,
    dueDate: undefined,
  })
  expect(JSON.parse(JSON.stringify(patch))).toEqual({
    clientId: "",
    description: "",
    dueDate: "",
  })
})
it("selecting a product copies editable values without modifying the catalog item or stock", () => {
  const product = {
    _id: "product-1",
    name: "Cup",
    finalPrice: 25,
    stock: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const concept = buildProductConcept(product)
  concept.name = "Personalized cup"
  concept.amount = 30
  expect(concept).toEqual({
    productId: "product-1",
    name: "Personalized cup",
    amount: 30,
    quantity: 1,
  })
  expect(product.stock).toBe(3)
  expect(product.finalPrice).toBe(25)
  expect(product.name).toBe("Cup")
})
