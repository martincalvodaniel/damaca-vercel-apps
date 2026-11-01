"use client"

import { useCallback, useId } from "react"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import type { EditableShoppingListItem } from "./shopping-list-preview"

interface ShoppingListPreviewRowProps {
  item: EditableShoppingListItem
  disabled: boolean
  onInventoryQuantityChange: (inventoryItemId: string, quantity: string) => void
  onShoppingQuantityChange: (inventoryItemId: string, quantity: string) => void
}

const quantityFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
})

export function ShoppingListPreviewRow({
  item,
  disabled,
  onInventoryQuantityChange,
  onShoppingQuantityChange,
}: ShoppingListPreviewRowProps) {
  const inventoryId = useId()
  const shoppingId = useId()
  const unitLabel = quantityUnitShortLabels[item.unit]

  const changeInventoryQuantity = useCallback(
    (quantity: string) =>
      onInventoryQuantityChange(item.inventoryItemId, quantity),
    [onInventoryQuantityChange, item]
  )

  const changeShoppingQuantity = useCallback(
    (quantity: string) =>
      onShoppingQuantityChange(item.inventoryItemId, quantity),
    [onShoppingQuantityChange, item]
  )

  return (
    <li className="grid gap-3 rounded-2xl border border-border bg-field p-3 lg:grid-cols-[minmax(10rem,1fr)_minmax(7rem,0.45fr)_repeat(2,minmax(10rem,0.65fr))] lg:items-center">
      <div className="flex min-w-0 items-baseline justify-between gap-3 lg:block">
        <p className="truncate font-semibold">{item.name}</p>
        <p className="shrink-0 text-xs text-muted lg:hidden">
          Necesitas {quantityFormatter.format(item.requiredQuantity)}{" "}
          {unitLabel}
        </p>
      </div>

      <div className="hidden text-sm font-semibold lg:block">
        {quantityFormatter.format(item.requiredQuantity)} {unitLabel}
      </div>

      <div className="text-xs font-semibold lg:text-sm">
        <label htmlFor={inventoryId}>
          <span className="sr-only">Inventario de {item.name}</span>
          <span className="lg:sr-only" aria-hidden="true">
            En inventario
          </span>
        </label>
        <QuantityInputStepper
          id={inventoryId}
          value={item.inventoryQuantity}
          unit={item.unit}
          minimum={0}
          label={`inventario de ${item.name}`}
          disabled={disabled}
          onValueChange={changeInventoryQuantity}
          className="mt-1.5 lg:mt-0"
        />
      </div>

      <div className="text-xs font-semibold lg:text-sm">
        <label htmlFor={shoppingId}>
          <span className="sr-only">Cantidad a añadir de {item.name}</span>
          <span className="lg:sr-only" aria-hidden="true">
            Añadir a la compra
          </span>
        </label>
        <QuantityInputStepper
          id={shoppingId}
          value={item.quantity}
          unit={item.unit}
          minimum={0}
          label={`compra de ${item.name}`}
          disabled={disabled}
          onValueChange={changeShoppingQuantity}
          className="mt-1.5 lg:mt-0"
        />
      </div>
    </li>
  )
}
