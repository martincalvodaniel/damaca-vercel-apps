import { describe, expect, it } from "bun:test"
import {
  accessEmailSchema,
  userAccessMutationSchema,
  userAccessQuerySchema,
} from "@/schemas/user-access"

describe("user access contracts", () => {
  it("normalizes email consistently", () => {
    expect(accessEmailSchema.parse(" User@Example.com ")).toBe(
      "user@example.com"
    )
  })

  it("rejects oversized emails and arbitrary role fields", () => {
    expect(
      accessEmailSchema.safeParse(`${"a".repeat(255)}@example.com`).success
    ).toBe(false)
    expect(
      userAccessMutationSchema.safeParse({
        email: "user@example.com",
        operation: "grant",
        role: "admin",
      }).success
    ).toBe(false)
  })

  it("accepts only a single valid pagination cursor", () => {
    expect(
      userAccessQuerySchema.safeParse({ after: ["user@example.com"] }).success
    ).toBe(false)
    expect(userAccessQuerySchema.safeParse({ after: "invalid" }).success).toBe(
      false
    )
    expect(userAccessQuerySchema.parse({})).toEqual({})
  })
})
