"use client"

import { useId } from "react"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import type { QuantityUnit } from "@/schemas/quantity-unit"

interface MealExecutionInventoryRowProps {
  item: {
    inventoryItemId: string
    name: string
    unit: QuantityUnit
    consumedQuantity: number
    initialQuantity: number
    finalQuantity: string
  }
  disabled: boolean
  onFinalQuantityChange: (inventoryItemId: string, quantity: string) => void
}

const quantityFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
})

export function MealExecutionInventoryRow({
  item,
  disabled,
  onFinalQuantityChange,
}: MealExecutionInventoryRowProps) {
  const finalQuantityId = useId()
  const unitLabel = quantityUnitShortLabels[item.unit]

  return (
    <li className="rounded-2xl border border-white/65 bg-white/55 p-3 dark:border-white/5 dark:bg-white/5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-semibold">{item.name}</p>
        <p className="shrink-0 text-xs text-[#69705b] dark:text-[#c0c7b5]">
          Necesitas {quantityFormatter.format(item.consumedQuantity)}{" "}
          {unitLabel}
        </p>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={finalQuantityId} className="text-xs font-semibold">
            Inventario final
          </label>
          <p className="shrink-0 text-xs text-[#69705b] dark:text-[#c0c7b5]">
            Inicial: {quantityFormatter.format(item.initialQuantity)}{" "}
            {unitLabel}
          </p>
        </div>
        <QuantityInputStepper
          id={finalQuantityId}
          value={item.finalQuantity}
          unit={item.unit}
          minimum={0}
          label={`inventario final de ${item.name}`}
          disabled={disabled}
          onValueChange={(quantity) =>
            onFinalQuantityChange(item.inventoryItemId, quantity)
          }
          className="mt-1.5"
          buttonClassName="border-[#c8cab1] bg-white text-[#69705b] hover:bg-[#eef1e8] dark:border-white/15 dark:bg-[#202d22] dark:text-[#c0c7b5] dark:hover:bg-white/10"
          fieldClassName="border-[#c8cab1] bg-white text-[#69705b] focus-within:border-[#74794f] focus-within:ring-[#74794f]/20 dark:border-white/15 dark:bg-[#202d22] dark:text-[#c0c7b5]"
        />
      </div>
    </li>
  )
}
