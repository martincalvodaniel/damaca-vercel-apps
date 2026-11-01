import { expect, test as it } from "bun:test"
import {
  buildCommissionByPaymentKey,
  buildCommissionByPaymentUrl,
  isCommissionByPaymentKey,
} from "./useCommissionByPayment"
import {
  buildCommissionRequest,
  isCommissionRelatedKey,
} from "./useCommissionMutations"
import {
  buildCommissionKey,
  buildCommissionsKey,
  buildCommissionsUrl,
  buildCommissionUrl,
  isCommissionsKey,
} from "./useCommissions"

it("stable primitive keys distinguish commission resources from other caches", () => {
  expect(buildCommissionsKey()).toEqual(["/api/commissions"])
  expect(buildCommissionsUrl()).toBe("/api/commissions")
  expect(buildCommissionKey("a")).toEqual(["/api/commissions", "a"])
  expect(buildCommissionUrl("a/b")).toBe("/api/commissions/a%2Fb")
  expect(isCommissionsKey(["/api/commissions", 1])).toBe(false)
  expect(isCommissionsKey(["/api/events"])).toBe(false)
  expect(buildCommissionByPaymentKey("p")).toEqual([
    "/api/commissions/payment",
    "p",
  ])
  expect(buildCommissionByPaymentUrl("a/b")).toBe(
    "/api/commissions/payment/a%2Fb"
  )
  expect(isCommissionByPaymentKey(["/api/commissions/payment", "p"])).toBe(true)
})
it("mutation payloads use the correct resource and preserve explicit clears", () => {
  expect(
    buildCommissionRequest("PUT", { id: "a", clientId: "", concepts: [] })
  ).toEqual({
    url: "/api/commissions",
    method: "PUT",
    body: '{"id":"a","clientId":"","concepts":[]}',
  })
  expect(
    buildCommissionRequest("POST", { paymentMethod: "card" }, "a/b").url
  ).toBe("/api/commissions/a%2Fb/payment")
})
it("invalidates lists, details, linked commissions and payments, without products/stock", () => {
  for (const key of [
    buildCommissionsKey(),
    buildCommissionKey("a"),
    buildCommissionByPaymentKey("p"),
    ["/api/payments", 2026, 1],
    ["/api/payments", "p"],
  ])
    expect(isCommissionRelatedKey(key)).toBe(true)
  expect(isCommissionRelatedKey(["/api/products", "", ""])).toBe(false)
  expect(isCommissionRelatedKey(["/api/clients", "", 1, 10])).toBe(false)
})
