"use client"

import { useCallback, useId } from "react"
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

  const changeFinalQuantity = useCallback(
    (quantity: string) => onFinalQuantityChange(item.inventoryItemId, quantity),
    [onFinalQuantityChange, item]
  )

  return (
    <li className="rounded-2xl border border-border bg-field p-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-semibold">{item.name}</p>
        <p className="shrink-0 text-xs text-muted">
          Necesitas {quantityFormatter.format(item.consumedQuantity)}{" "}
          {unitLabel}
        </p>
      </div>
      <div className="mt-3">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={finalQuantityId} className="text-xs font-semibold">
            Inventario final
          </label>
          <p className="shrink-0 text-xs text-muted">
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
          onValueChange={changeFinalQuantity}
          className="mt-1.5"
        />
      </div>
    </li>
  )
}
