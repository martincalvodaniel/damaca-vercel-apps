import { describe, expect, it } from "bun:test"
import { manageUserAccess } from "@/features/admin/manage-access"
import type { AccessRole } from "@/types/access"

function fixture(role: AccessRole | null = "admin") {
  const calls: string[] = []
  return {
    calls,
    dependencies: {
      getActorRole: async () => role,
      isAdminEmail: (email: string) => email === "admin@example.com",
      grant: async (email: string) => {
        calls.push(`grant:${email}`)
      },
      revoke: async (email: string) => {
        calls.push(`revoke:${email}`)
      },
    },
  }
}

describe("access management", () => {
  it("denies anonymous and normal users before persistence", async () => {
    for (const role of [null, "user"] as const) {
      const { calls, dependencies } = fixture(role)
      expect(
        (
          await manageUserAccess(
            { email: "user@example.com", operation: "grant" },
            dependencies
          )
        ).status
      ).toBe("error")
      expect(calls).toEqual([])
    }
  })

  it("rejects invalid email, operations, and privilege injection", async () => {
    const { calls, dependencies } = fixture()
    for (const input of [
      { email: "invalid", operation: "grant" },
      { email: "user@example.com", operation: "promote" },
      { email: "user@example.com", operation: "grant", role: "admin" },
      { email: new File([], "email"), operation: "grant" },
    ]) {
      expect((await manageUserAccess(input, dependencies)).status).toBe("error")
    }
    expect(calls).toEqual([])
  })

  it("does not mutate environment-managed administrators", async () => {
    const { calls, dependencies } = fixture()
    for (const operation of ["grant", "revoke"]) {
      expect(
        (
          await manageUserAccess(
            { email: " ADMIN@example.com ", operation },
            dependencies
          )
        ).status
      ).toBe("error")
    }
    expect(calls).toEqual([])
  })

  it("passes normalized grants and revocations to persistence", async () => {
    const { calls, dependencies } = fixture()
    for (const operation of ["grant", "revoke"]) {
      expect(
        (
          await manageUserAccess(
            { email: " USER@example.com ", operation },
            dependencies
          )
        ).status
      ).toBe("success")
    }
    expect(calls).toEqual(["grant:user@example.com", "revoke:user@example.com"])
  })

  it("sanitizes database and session lookup errors", async () => {
    const { dependencies } = fixture()
    dependencies.grant = async () => {
      throw new Error("mongodb://private-host secret")
    }
    const result = await manageUserAccess(
      { email: "user@example.com", operation: "grant" },
      dependencies
    )
    expect(result.status).toBe("error")
    expect(result.message).not.toContain("secret")
    dependencies.getActorRole = async () => {
      throw new Error("session secret")
    }
    expect(
      (
        await manageUserAccess(
          { email: "user@example.com", operation: "revoke" },
          dependencies
        )
      ).status
    ).toBe("error")
  })
})
