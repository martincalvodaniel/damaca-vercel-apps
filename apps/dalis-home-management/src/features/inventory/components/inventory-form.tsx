"use client"

import {
  type FormEvent,
  useCallback,
  useId,
  useState,
  useTransition,
} from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
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
  const formId = useId()
  const nameId = useId()
  const quantityId = useId()
  const unitId = useId()
  const purchasePlaceId = useId()
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1))
  const [unit, setUnit] = useState<QuantityUnit>(item?.unit ?? "unit")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEditing = item !== null

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
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
    },
    [quantity, item, onSaved, unit]
  )

  const changeUnit = useCallback(
    (value: string) => setUnit(value as QuantityUnit),
    []
  )

  return (
    <section className="flex h-full min-h-0 flex-col bg-surface">
      <DialogHeader
        title={isEditing ? item.name : "Añadir al inventario"}
        onDismiss={onCancel}
        cancelDisabled={isPending}
        confirmLabel={
          isPending ? "Guardando…" : isEditing ? "Guardar" : "Añadir"
        }
        confirmDisabled={isPending}
        confirmForm={formId}
        pending={isPending}
      />

      <form
        id={formId}
        className="dialog-content space-y-4 p-4 sm:p-6"
        onSubmit={handleSubmit}
      >
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
            className="mt-2 min-h-12 w-full rounded-xl border border-control-border bg-field px-4 font-normal outline-none transition placeholder:text-placeholder focus:border-ring focus:ring-2 focus:ring-ring"
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
            />
          </div>
          <div className="block text-sm font-semibold">
            <label htmlFor={unitId}>Unidad</label>
            <SelectField
              id={unitId}
              value={unit}
              onValueChange={changeUnit}
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
      </form>
    </section>
  )
}
