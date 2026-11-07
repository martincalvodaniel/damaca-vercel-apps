import { describe, expect, it } from "bun:test"
import { requestAccess } from "@/features/auth/request-access"

function fixture(email: string | null = "requester@example.com") {
  const submitted: string[] = []
  return {
    submitted,
    dependencies: {
      getVerifiedEmail: async () => email,
      getRole: async () => null,
      submit: async (value: string) => {
        submitted.push(value)
      },
    },
  }
}

describe("access requests", () => {
  it("denies missing verified identity without writing", async () => {
    const { submitted, dependencies } = fixture(null)
    expect(
      (await requestAccess({ operation: "request" }, dependencies)).status
    ).toBe("error")
    expect(submitted).toEqual([])
  })
  it("derives normalized email from the verified session", async () => {
    const { submitted, dependencies } = fixture(" Requester@Example.com ")
    expect(
      (await requestAccess({ operation: "request" }, dependencies)).status
    ).toBe("success")
    expect(submitted).toEqual(["requester@example.com"])
  })
  it("rejects client-supplied identity and invalid operations", async () => {
    const { submitted, dependencies } = fixture()
    for (const input of [
      { operation: "request", email: "victim@example.com" },
      { operation: "approve" },
      null,
    ]) {
      expect((await requestAccess(input, dependencies)).status).toBe("error")
    }
    expect(submitted).toEqual([])
  })
  it("rejects already authorized accounts", async () => {
    const { submitted, dependencies } = fixture()
    expect(
      (
        await requestAccess(
          { operation: "request" },
          { ...dependencies, getRole: async () => "user" }
        )
      ).status
    ).toBe("error")
    expect(submitted).toEqual([])
  })
  it("sanitizes session and persistence failures", async () => {
    const { dependencies } = fixture()
    const result = await requestAccess(
      { operation: "request" },
      {
        ...dependencies,
        submit: async () => {
          throw new Error("private database details")
        },
      }
    )
    expect(result.status).toBe("error")
    expect(result.message).not.toContain("private")
  })
})
