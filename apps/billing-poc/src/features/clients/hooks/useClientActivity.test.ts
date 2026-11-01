import { expect, test as it } from "bun:test"
import { isCommissionRelatedKey } from "@/features/commissions/hooks/useCommissionMutations"
import {
  buildClientActivityKey,
  buildClientActivityUrl,
  isClientActivityKey,
} from "./useClientActivity"
import { isClientsKey } from "./useClients"

it("activity keys distinguish clients and encode IDs in the URL", () => {
  expect(buildClientActivityKey("a")).toEqual(["/api/clients", "activity", "a"])
  expect(buildClientActivityKey("a")).not.toEqual(buildClientActivityKey("b"))
  expect(buildClientActivityUrl("a/b")).toBe("/api/clients/a%2Fb/activity")
})
it("activity is invalidated by client and commission mutations", () => {
  const key = buildClientActivityKey("a")
  expect(isClientActivityKey(key)).toBe(true)
  expect(isClientsKey(key)).toBe(true)
  expect(isCommissionRelatedKey(key)).toBe(true)
  for (const other of [
    null,
    "/api/clients",
    ["/api/clients", "a"],
    ["/api/clients", "by-ids", "a"],
    ["/api/clients", "activity", 1],
  ]) {
    expect(isClientActivityKey(other)).toBe(false)
  }
})
