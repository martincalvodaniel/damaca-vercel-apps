import { describe, expect, it } from "bun:test"
import {
  applicationAccessMutationSchema,
  applicationMutationSchema,
  applicationRequestReviewSchema,
} from "@/schemas/hub"

describe("Damaca Hub contracts", () => {
  it("normalizes catalog URLs and accepts inactive applications", () => {
    const result = applicationMutationSchema.parse({
      id: "card-wars",
      name: " Card Wars ",
      description: " Track games ",
      productionUrl: "https://example.com",
      preproductionUrl: "",
      order: "15",
      active: "false",
    })

    expect(result).toEqual({
      id: "card-wars",
      name: "Card Wars",
      description: "Track games",
      productionUrl: "https://example.com",
      preproductionUrl: null,
      order: 15,
      active: false,
    })
  })

  it("rejects unsafe URLs and attempts to change an application identity", () => {
    expect(
      applicationMutationSchema.safeParse({
        id: "../../admin",
        name: "Example",
        description: "Example",
        productionUrl: "https://user:password@example.com",
        preproductionUrl: "",
        order: 0,
        active: "true",
      }).success
    ).toBe(false)
  })

  it("requires a normalized app-scoped address and a current request UUID", () => {
    expect(
      applicationAccessMutationSchema.parse({
        appId: "card-wars",
        email: " USER@example.com ",
        operation: "grant",
      }).email
    ).toBe("user@example.com")
    expect(
      applicationRequestReviewSchema.safeParse({
        appId: "card-wars",
        email: "user@example.com",
        requestId: "old-request",
        decision: "approve",
      }).success
    ).toBe(false)
  })
})
