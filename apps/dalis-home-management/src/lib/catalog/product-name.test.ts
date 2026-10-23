import { describe, expect, test } from "bun:test"
import { normalizeProductName } from "./product-name"

describe("product name normalization", () => {
  test("trims, collapses whitespace, and normalizes case", () => {
    expect(normalizeProductName("  Tomate   TRITURADO ")).toBe(
      "tomate triturado"
    )
  })

  test("uses Spanish casing rules", () => {
    expect(normalizeProductName("ÑORA")).toBe("ñora")
  })
})
