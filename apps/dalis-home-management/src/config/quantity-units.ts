import type { QuantityUnit } from "@/schemas/quantity-unit"

export const quantityUnitLabels: Record<QuantityUnit, string> = {
  unit: "unidades",
  gram: "gramos",
  kilogram: "kilogramos",
  milliliter: "mililitros",
  liter: "litros",
}

export const quantityUnitShortLabels: Record<QuantityUnit, string> = {
  unit: "uds.",
  gram: "g",
  kilogram: "kg",
  milliliter: "ml",
  liter: "l",
}
