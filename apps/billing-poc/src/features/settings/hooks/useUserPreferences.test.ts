import { describe, expect, test as it } from "bun:test"
import {
  buildUpdateUserPreferencesRequest,
  buildUserPreferencesKey,
  buildUserPreferencesUrl,
  isUserPreferencesKey,
} from "./useUserPreferences"

describe("user preferences requests", () => {
  it("separates cache entries by account without transmitting an identity", () => {
    const alice = buildUserPreferencesKey("alice@example.com")
    const bob = buildUserPreferencesKey("bob@example.com")
    expect(alice).not.toEqual(bob)
    expect(isUserPreferencesKey(alice)).toBe(true)
    expect(isUserPreferencesKey(bob)).toBe(true)
    expect(buildUserPreferencesUrl()).toBe("/api/user-preferences")
  })

  for (const key of [
    null,
    {},
    [],
    ["/api/user-preferences"],
    ["/api/user-preferences", ""],
    ["/api/clients", "alice"],
    ["/api/user-preferences", 1],
  ]) {
    it(`rejects unrelated or malformed cache key ${JSON.stringify(key)}`, () => {
      expect(isUserPreferencesKey(key)).toBe(false)
    })
  }

  it("uses same-origin PUT and sends only the selected theme", () => {
    const init = buildUpdateUserPreferencesRequest({ theme: "olive" })
    expect(init.method).toBe("PUT")
    expect(init.credentials).toBe("same-origin")
    expect(init.headers).toEqual({ "Content-Type": "application/json" })
    expect(JSON.parse(String(init.body))).toEqual({ theme: "olive" })
  })
})
