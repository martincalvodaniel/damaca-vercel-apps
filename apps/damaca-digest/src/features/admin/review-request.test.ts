import { describe, expect, it } from "bun:test"
import { reviewAccessRequest } from "@/features/admin/review-request"
import type { AccessRole } from "@/types/access"

const input = {
  email: "requester@example.com",
  requestId: crypto.randomUUID(),
  decision: "approve",
}

function fixture(role: AccessRole | null = "admin") {
  const writes: unknown[] = []
  return {
    writes,
    dependencies: {
      getActorRole: async () => role,
      isAdminEmail: (email: string) => email === "admin@example.com",
      resolve: async (...args: unknown[]) => {
        writes.push(args)
        return true
      },
    },
  }
}

describe("request review", () => {
  it("denies anonymous and normal users", async () => {
    for (const role of [null, "user"] as const) {
      const { writes, dependencies } = fixture(role)
      expect((await reviewAccessRequest(input, dependencies)).status).toBe(
        "error"
      )
      expect(writes).toEqual([])
    }
  })
  it("validates decisions and request IDs before persistence", async () => {
    const { writes, dependencies } = fixture()
    for (const invalid of [
      { ...input, requestId: "invalid" },
      { ...input, decision: "admin" },
      { ...input, role: "admin" },
    ])
      expect((await reviewAccessRequest(invalid, dependencies)).status).toBe(
        "error"
      )
    expect(writes).toEqual([])
  })
  it("prevents administrator changes", async () => {
    const { writes, dependencies } = fixture()
    expect(
      (
        await reviewAccessRequest(
          { ...input, email: " ADMIN@example.com " },
          dependencies
        )
      ).status
    ).toBe("error")
    expect(writes).toEqual([])
  })
  it("passes the exact request identity to conditional review", async () => {
    const { writes, dependencies } = fixture()
    for (const decision of ["approve", "reject"])
      expect(
        (await reviewAccessRequest({ ...input, decision }, dependencies)).status
      ).toBe("success")
    expect(writes).toEqual([
      [input.email, input.requestId, "approve"],
      [input.email, input.requestId, "reject"],
    ])
  })
  it("reports stale decisions and sanitizes database errors", async () => {
    const { dependencies } = fixture()
    expect(
      (
        await reviewAccessRequest(input, {
          ...dependencies,
          resolve: async () => false,
        })
      ).status
    ).toBe("error")
    const result = await reviewAccessRequest(input, {
      ...dependencies,
      resolve: async () => {
        throw new Error("private database details")
      },
    })
    expect(result.status).toBe("error")
    expect(result.message).not.toContain("private")
  })
})
