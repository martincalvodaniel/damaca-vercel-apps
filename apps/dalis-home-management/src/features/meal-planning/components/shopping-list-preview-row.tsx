"use client"

import { useId } from "react"
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

  return (
    <li className="grid gap-3 rounded-2xl border border-white/65 bg-white/55 p-3 lg:grid-cols-[minmax(10rem,1fr)_minmax(7rem,0.45fr)_repeat(2,minmax(10rem,0.65fr))] lg:items-center dark:border-white/5 dark:bg-white/5">
      <div className="flex min-w-0 items-baseline justify-between gap-3 lg:block">
        <p className="truncate font-semibold">{item.name}</p>
        <p className="shrink-0 text-xs text-[#69705b] lg:hidden dark:text-[#c0c7b5]">
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
          onValueChange={(quantity) =>
            onInventoryQuantityChange(item.inventoryItemId, quantity)
          }
          className="mt-1.5 lg:mt-0"
          buttonClassName="border-[#c8cab1] bg-white text-[#69705b] hover:bg-[#eef1e8] dark:border-white/15 dark:bg-[#202d22] dark:text-[#c0c7b5] dark:hover:bg-white/10"
          fieldClassName="border-[#c8cab1] bg-white text-[#69705b] focus-within:border-[#74794f] focus-within:ring-[#74794f]/20 dark:border-white/15 dark:bg-[#202d22] dark:text-[#c0c7b5]"
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
          onValueChange={(quantity) =>
            onShoppingQuantityChange(item.inventoryItemId, quantity)
          }
          className="mt-1.5 lg:mt-0"
          buttonClassName="border-[#d6b49f] bg-[#fff8ed] text-[#7d5947] hover:bg-[#faebdc] dark:border-[#80543d] dark:bg-[#3c2d24] dark:text-[#e4c3b3] dark:hover:bg-[#49362b]"
          fieldClassName="border-[#d6b49f] bg-[#fff8ed] text-[#7d5947] focus-within:border-[#a75938] focus-within:ring-[#a75938]/20 dark:border-[#80543d] dark:bg-[#3c2d24] dark:text-[#e4c3b3]"
        />
      </div>
    </li>
  )
}
