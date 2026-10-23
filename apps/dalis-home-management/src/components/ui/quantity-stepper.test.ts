import { describe, expect, test } from "bun:test"
import {
  adjustQuantity,
  getQuantityStep,
} from "@/components/ui/quantity-stepper-value"

describe("quantity stepper adjustment", () => {
  test("uses whole or decimal steps according to the product unit", () => {
    expect(getQuantityStep("unit")).toBe(1)
    expect(getQuantityStep("gram")).toBe(1)
    expect(getQuantityStep("milliliter")).toBe(1)
    expect(getQuantityStep("kilogram")).toBe(0.1)
    expect(getQuantityStep("liter")).toBe(0.1)
  })

  test("moves residual whole-unit quantities to the next valid integer", () => {
    expect(adjustQuantity(0.01, 1, "increase", 0.01)).toBe(1)
    expect(adjustQuantity(1.01, 1, "decrease", 0.01)).toBe(1)
  })

  test("moves quantities already on a step by one full step", () => {
    expect(adjustQuantity(1, 1, "increase", 0.01)).toBe(2)
    expect(adjustQuantity(1, 1, "decrease", 0.01)).toBe(0.01)
    expect(adjustQuantity(0.1, 0.1, "increase", 0.01)).toBe(0.2)
    expect(adjustQuantity(0.3, 0.1, "increase", 0.01)).toBe(0.4)
  })

  test("aligns decimal quantities and respects their bounds", () => {
    expect(adjustQuantity(0.01, 0.1, "increase", 0.01)).toBe(0.1)
    expect(adjustQuantity(0.11, 0.1, "decrease", 0.01)).toBe(0.1)
    expect(adjustQuantity(0.01, 1, "decrease", 0.01)).toBe(0.01)
    expect(adjustQuantity(999_998.9, 1, "increase", 0.01)).toBe(999_999)
  })
})
