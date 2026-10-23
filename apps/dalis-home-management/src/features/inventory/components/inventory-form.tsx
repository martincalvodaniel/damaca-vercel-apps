"use client"

import { type FormEvent, useId, useState, useTransition } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { SelectField } from "@/components/ui/select-field"
import { PurchasePlaceField } from "@/features/catalog/components/purchase-place-field"
import { normalizePurchasePlaces } from "@/features/catalog/purchase-places"
import {
  createInventoryItemAction,
  updateInventoryItemAction,
} from "@/features/inventory/actions"
import { inventoryUnitLabels } from "@/features/inventory/inventory-options"
import type { InventoryItem } from "@/schemas/inventory-item"
import { inventoryItemUnits } from "@/schemas/inventory-item"
import type { QuantityUnit } from "@/schemas/quantity-unit"

interface InventoryFormProps {
  item: InventoryItem | null
  initialName?: string
  purchasePlaces: readonly string[]
  onCancel: () => void
  onSaved: () => void
}

const unitOptions = inventoryItemUnits.map((unit) => ({
  value: unit,
  label: inventoryUnitLabels[unit],
}))

export function InventoryForm({
  item,
  initialName,
  purchasePlaces,
  onCancel,
  onSaved,
}: InventoryFormProps) {
  const nameId = useId()
  const quantityId = useId()
  const unitId = useId()
  const purchasePlaceId = useId()
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1))
  const [unit, setUnit] = useState<QuantityUnit>(item?.unit ?? "unit")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = item !== null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const input = {
      name: formData.get("name"),
      quantity: Number(quantity),
      unit,
      purchasePlaces: normalizePurchasePlaces(
        [
          ...formData.getAll("purchasePlaces"),
          formData.get("purchasePlaceDraft"),
        ].filter((value): value is string => typeof value === "string")
      ),
    }

    startTransition(async () => {
      try {
        const result = item
          ? await updateInventoryItemAction(item.id, input)
          : await createInventoryItemAction(input)

        if (!result.success) {
          setError(result.message)
          return
        }

        form.reset()
        onSaved()
      } catch {
        setError("No se ha podido guardar el producto. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <section className="rounded-[1.75rem] border border-[#dde1d8] bg-[#fbfaf6] p-5 shadow-[0_18px_50px_rgba(50,72,60,0.08)] sm:p-6 dark:border-white/10 dark:bg-[#182e26]">
      <header className="sticky -top-5 z-10 -mx-5 -mt-5 border-b border-[#dde1d8] bg-[#fbfaf6] px-5 pt-5 pb-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 dark:border-white/10 dark:bg-[#182e26]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c36d49]">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
          {isEditing ? item.name : "Añadir al inventario"}
        </h2>
      </header>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold" htmlFor={nameId}>
          Nombre
          <input
            id={nameId}
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={item?.name ?? initialName}
            placeholder="Por ejemplo, arroz"
            className="mt-2 min-h-12 w-full rounded-xl border border-[#ccd5ca] bg-white px-4 font-normal outline-none transition placeholder:text-[#9aa59e] focus:border-[#1d4f40] focus:ring-2 focus:ring-[#1d4f40]/15 dark:border-white/15 dark:bg-[#10231c] dark:placeholder:text-[#718078]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="text-sm font-semibold">
            <label htmlFor={quantityId}>Cantidad</label>
            <QuantityInputStepper
              id={quantityId}
              value={quantity}
              unit={unit}
              minimum={0}
              label={item?.name ?? "producto"}
              disabled={isPending}
              required
              onValueChange={setQuantity}
              className="mt-2"
              buttonClassName="border-[#ccd5ca] bg-white text-[#365b43] hover:bg-[#edf0e9] dark:border-white/15 dark:bg-[#10231c] dark:text-[#cfe2d5] dark:hover:bg-white/10"
              fieldClassName="border-[#ccd5ca] bg-white text-[#365b43] focus-within:border-[#1d4f40] focus-within:ring-[#1d4f40]/15 dark:border-white/15 dark:bg-[#10231c] dark:text-[#cfe2d5]"
            />
          </div>
          <div className="block text-sm font-semibold">
            <label htmlFor={unitId}>Unidad</label>
            <SelectField
              id={unitId}
              value={unit}
              onValueChange={(value) => setUnit(value as QuantityUnit)}
              options={unitOptions}
              className="mt-2"
            />
          </div>
        </div>

        <PurchasePlaceField
          id={purchasePlaceId}
          defaultValues={item?.purchasePlaces}
          purchasePlaces={purchasePlaces}
        />

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <div className="sticky -bottom-5 z-10 -mx-5 -mb-5 flex gap-2 border-t border-[#dde1d8] bg-[#fbfaf6] px-5 py-4 sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6 dark:border-white/10 dark:bg-[#182e26]">
          <button
            type="submit"
            disabled={isPending}
            className="order-2 inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#1d4f40] px-5 text-sm font-semibold text-white transition hover:bg-[#173f34] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:ring-offset-[#182e26]"
          >
            {isPending ? "Guardando…" : isEditing ? "Guardar" : "Añadir"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="order-1 inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#ccd5ca] px-5 text-sm font-semibold transition hover:bg-[#edf0e9] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
