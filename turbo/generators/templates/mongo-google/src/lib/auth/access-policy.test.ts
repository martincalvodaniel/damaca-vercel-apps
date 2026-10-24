import { describe, expect, it } from "bun:test"
import { resolveAccessRole } from "@/lib/auth/access-policy"

const adminEmails = new Set(["admin@example.com"])

describe("access roles", () => {
  it("resolves administrators without depending on MongoDB", async () => {
    const role = await resolveAccessRole(" ADMIN@example.com ", {
      adminEmails,
      hasUserAccess: () => {
        throw new Error("Database unavailable")
      },
    })
    expect(role).toBe("admin")
  })

  it("normalizes normal users and never promotes them to administrators", async () => {
    const calls: string[] = []
    const role = await resolveAccessRole(" User@example.com ", {
      adminEmails,
      hasUserAccess: async (email) => {
        calls.push(email)
        return true
      },
    })
    expect(role).toBe("user")
    expect(calls).toEqual(["user@example.com"])
  })

  it("rejects missing grants and observes revocation on the next check", async () => {
    const grants = new Set(["user@example.com"])
    const policy = {
      adminEmails,
      hasUserAccess: async (email: string) => grants.has(email),
    }
    expect(await resolveAccessRole("user@example.com", policy)).toBe("user")
    grants.delete("user@example.com")
    expect(await resolveAccessRole("user@example.com", policy)).toBeNull()
    expect(await resolveAccessRole("unknown@example.com", policy)).toBeNull()
  })

  it("rejects malformed email without querying persistence", async () => {
    expect(
      await resolveAccessRole("invalid", {
        adminEmails,
        hasUserAccess: () => {
          throw new Error("Must not run")
        },
      })
    ).toBeNull()
  })

  it("propagates persistence failures instead of granting fallback access", async () => {
    await expect(
      resolveAccessRole("user@example.com", {
        adminEmails,
        hasUserAccess: async () => {
          throw new Error("Database unavailable")
        },
      })
    ).rejects.toThrow("Database unavailable")
  })
})
