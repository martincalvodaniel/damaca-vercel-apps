import { describe, expect, test as it } from "bun:test"
import {
  createCommissionSchema,
  generateCommissionPaymentSchema,
  updateCommissionSchema,
} from "./commission-validator"

const id = "507f1f77bcf86cd799439011"

describe("commission validation", () => {
  it("requires title only and applies defaults", () => {
    expect(createCommissionSchema.parse({ title: " Work " })).toMatchObject({
      title: "Work",
      paymentStatus: 0,
      vat: 21,
      concepts: [],
    })
    for (const title of [undefined, "", "   "])
      expect(createCommissionSchema.safeParse({ title }).success).toBe(false)
  })
  it("normalizes removable optional fields, including explicit nulls", () => {
    const parsed = updateCommissionSchema.parse({
      id,
      description: " ",
      clientId: null,
      dueDate: "",
    })
    expect(parsed).toEqual({
      id,
      description: undefined,
      clientId: undefined,
      dueDate: undefined,
    })
  })
  it("a status-only patch does not clear omitted optional fields or reset defaults", () => {
    expect(updateCommissionSchema.parse({ id, paymentStatus: 100 })).toEqual({
      id,
      paymentStatus: 100,
    })
  })
  it("validates real calendar dates and tri-state values", () => {
    for (const dueDate of [
      "2026-02-29",
      "2026-04-31",
      "2026-13-01",
      "2026-01-01T00:00:00Z",
    ])
      expect(
        createCommissionSchema.safeParse({ title: "Work", dueDate }).success
      ).toBe(false)
    expect(
      createCommissionSchema.safeParse({ title: "Work", dueDate: "2028-02-29" })
        .success
    ).toBe(true)
    for (const paymentStatus of [0, 50, 100])
      expect(
        createCommissionSchema.safeParse({ title: "Work", paymentStatus })
          .success
      ).toBe(true)
    for (const paymentStatus of [25, -1, 101, "50"])
      expect(
        createCommissionSchema.safeParse({ title: "Work", paymentStatus })
          .success
      ).toBe(false)
  })
  it("validates each concept while allowing no concepts", () => {
    const concept = { name: "Work", amount: 0, quantity: 1, productId: id }
    expect(
      createCommissionSchema.safeParse({ title: "Work", concepts: [concept] })
        .success
    ).toBe(true)
    for (const change of [
      { name: " " },
      { amount: Number.NaN },
      { amount: Infinity },
      { quantity: 0 },
      { quantity: -1 },
      { productId: "invalid" },
    ])
      expect(
        createCommissionSchema.safeParse({
          title: "Work",
          concepts: [{ ...concept, ...change }],
        }).success
      ).toBe(false)
    for (const vat of [-1, 101, Infinity])
      expect(
        createCommissionSchema.safeParse({ title: "Work", vat }).success
      ).toBe(false)
  })
  it("requires a supported payment method", () => {
    expect(
      generateCommissionPaymentSchema.safeParse({ paymentMethod: "cash" })
        .success
    ).toBe(true)
    expect(
      generateCommissionPaymentSchema.safeParse({ paymentMethod: "crypto" })
        .success
    ).toBe(false)
  })
})
