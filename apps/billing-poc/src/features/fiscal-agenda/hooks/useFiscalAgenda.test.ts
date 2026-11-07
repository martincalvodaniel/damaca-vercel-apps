import { expect, test as it } from "bun:test"
import {
  buildFiscalAgendaKey,
  buildFiscalAgendaUrl,
  buildFiscalRequest,
  isFiscalAgendaKey,
} from "./useFiscalAgenda"

it("scopes cache invalidation to the signed-in user across years", () => {
  expect(isFiscalAgendaKey(buildFiscalAgendaKey("a", 2026), "a")).toBe(true)
  expect(isFiscalAgendaKey(buildFiscalAgendaKey("a", 2027), "a")).toBe(true)
  expect(isFiscalAgendaKey(buildFiscalAgendaKey("b", 2026), "a")).toBe(false)
  expect(buildFiscalAgendaUrl(2026)).toBe("/api/fiscal-agenda?year=2026")
})

it("encodes identifiers and sends only action data", () => {
  expect(buildFiscalRequest({ method: "DELETE", id: "a&b" })).toEqual([
    "/api/fiscal-agenda?id=a%26b",
    { method: "DELETE" },
  ])
  const body = { action: "incorporate" as const, ids: ["one"], year: 2026 }
  const [, init] = buildFiscalRequest({ method: "POST", body })
  expect(init.body).toBe(JSON.stringify(body))
})
