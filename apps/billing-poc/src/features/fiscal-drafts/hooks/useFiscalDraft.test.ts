import { expect, test as it } from "bun:test"
import {
  draftRequest,
  fiscalDraftKey,
  fiscalDraftUrl,
  isFiscalDraftKey,
} from "./useFiscalDraft"

it("scopes draft cache by owner and period", () => {
  expect(isFiscalDraftKey(fiscalDraftKey("one", "303", 4), "one")).toBe(true)
  expect(isFiscalDraftKey(fiscalDraftKey("one", "303", 4), "two")).toBe(false)
  expect(fiscalDraftUrl("390", 4)).toBe(
    "/api/fiscal-drafts?year=2026&model=390&quarter=4"
  )
  expect(
    draftRequest({
      action: "input",
      name: "carry",
      amount: 0,
      reason: "Verified",
    }).method
  ).toBe("PUT")
})
