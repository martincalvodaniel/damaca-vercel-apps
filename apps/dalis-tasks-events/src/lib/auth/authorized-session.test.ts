import "server-only"

import { describe, expect, test as it } from "bun:test"
import { authorizePersistedSession } from "@/lib/auth/authorized-session"

const now = new Date("2026-10-06T12:00:00Z")

function createSession() {
  return {
    user: {
      id: "persisted-user",
      email: "alpha@example.test",
      emailVerified: true,
    },
    session: {
      userId: "persisted-user",
      expiresAt: new Date("2026-10-07T12:00:00Z"),
    },
  }
}

describe("persisted session authorization", () => {
  it("accepts a verified, unexpired matching identity", () => {
    const session = createSession()
    expect(authorizePersistedSession(session, now)).toBe(session)
  })

  it("rejects missing, expired and invalid sessions", () => {
    expect(authorizePersistedSession(null, now)).toBeNull()
    for (const expiresAt of [
      now,
      new Date("2026-10-05"),
      new Date("invalid"),
    ]) {
      const session = createSession()
      session.session.expiresAt = expiresAt
      expect(authorizePersistedSession(session, now)).toBeNull()
    }
  })

  it("rejects mismatched, empty and unverified identities", () => {
    const mismatch = createSession()
    mismatch.session.userId = "another-user"
    expect(authorizePersistedSession(mismatch, now)).toBeNull()
    const empty = createSession()
    empty.user.id = " "
    expect(authorizePersistedSession(empty, now)).toBeNull()
    const unverified = createSession()
    unverified.user.emailVerified = false
    expect(authorizePersistedSession(unverified, now)).toBeNull()
  })
})
