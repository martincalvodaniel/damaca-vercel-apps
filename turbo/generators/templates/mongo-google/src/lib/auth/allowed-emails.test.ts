import { describe, expect, test as it, test } from "bun:test"
import { isEmailAllowed, parseAllowedEmails } from "./allowed-emails"

describe("email allowlist", () => {
  it("normalizes configured and submitted addresses", () => {
    const allowedEmails = parseAllowedEmails(
      " owner@example.com,SECOND@example.com "
    )

    expect(isEmailAllowed("OWNER@example.com", allowedEmails)).toBe(true)
    expect(isEmailAllowed("second@example.com", allowedEmails)).toBe(true)
  })

  it("rejects addresses outside the allowlist", () => {
    const allowedEmails = parseAllowedEmails("owner@example.com")

    expect(isEmailAllowed("other@example.com", allowedEmails)).toBe(false)
  })
})
