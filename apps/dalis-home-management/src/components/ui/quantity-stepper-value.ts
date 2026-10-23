import type { QuantityUnit } from "@/schemas/quantity-unit"

const quantitySteps: Record<QuantityUnit, number> = {
  unit: 1,
  gram: 1,
  kilogram: 0.1,
  milliliter: 1,
  liter: 0.1,
}

export function getQuantityStep(unit: QuantityUnit): number {
  return quantitySteps[unit]
}

export function adjustQuantity(
  value: number,
  step: number,
  direction: "decrease" | "increase",
  minimum: number
): number {
  const stepPosition = value / step
  const stepTolerance = 1e-9
  const nextStepPosition =
    direction === "increase"
      ? Math.floor(stepPosition + stepTolerance) + 1
      : Math.ceil(stepPosition - stepTolerance) - 1
  const adjustedValue = Math.round(nextStepPosition * step * 1000) / 1000
  return Math.min(999_999, Math.max(minimum, adjustedValue))
}
