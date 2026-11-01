"use client"

import type * as React from "react"
import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
import { ErrorBanner } from "@/components/ui/error-banner"
import { SelectField } from "@/components/ui/select-field"
import { createCatalogProductAction } from "@/features/catalog/actions"
import { PurchasePlaceField } from "@/features/catalog/components/purchase-place-field"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import { normalizePurchasePlaces } from "@/features/catalog/purchase-places"
import { inventoryUnitLabels } from "@/features/inventory/inventory-options"
import { useDialogViewport } from "@/hooks/use-dialog-viewport"
import { inventoryItemUnits } from "@/schemas/inventory-item"

interface CatalogProductDialogProps {
  open: boolean
  initialName?: string
  purchasePlaces: readonly string[]
  onDismiss: () => void
  onCreated: (product: CatalogProductOption, created: boolean) => void
}

const unitOptions = inventoryItemUnits.map((unit) => ({
  value: unit,
  label: inventoryUnitLabels[unit],
}))

export function CatalogProductDialog({
  open,
  initialName,
  purchasePlaces,
  onDismiss,
  onCreated,
}: CatalogProductDialogProps) {
  const dialogRef = useDialogViewport(open)
  const nameId = useId()
  const unitId = useId()
  const purchasePlaceId = useId()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (!open) {
      if (dialog.open) {
        dialog.close()
      }
      return
    }

    if (!dialog.open) {
      dialog.showModal()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, dialogRef])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      const form = event.currentTarget
      const formData = new FormData(form)

      startTransition(async () => {
        try {
          const result = await createCatalogProductAction({
            name: formData.get("name"),
            unit: formData.get("unit"),
            purchasePlaces: normalizePurchasePlaces(
              [
                ...formData.getAll("purchasePlaces"),
                formData.get("purchasePlaceDraft"),
              ].filter((value): value is string => typeof value === "string")
            ),
          })
          if (!result.success) {
            setError(result.message)
            return
          }

          form.reset()
          onCreated(result.product, result.created)
        } catch {
          setError("No se ha podido crear el producto. Inténtalo de nuevo.")
        }
      })
    },
    [onCreated]
  )

  const handleCancel = useCallback(
    (event: React.SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isPending) {
        onDismiss()
      }
    },
    [isPending, onDismiss]
  )

  return (
    <dialog
      ref={dialogRef}
      aria-label="Crear producto"
      onCancel={handleCancel}
      className="fullscreen-dialog bg-[#fbfaf6] p-0 text-[#17352b] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:bg-[#182e26] dark:text-[#f4f1e7]"
    >
      <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
        <DialogHeader
          title="Crear producto"
          onDismiss={onDismiss}
          cancelDisabled={isPending}
          confirmLabel={isPending ? "Creando…" : "Crear y seleccionar"}
          confirmDisabled={isPending}
          pending={isPending}
        />
        <div className="dialog-content space-y-4 p-4 sm:p-6">
          <p className="text-sm text-[#63736a] dark:text-[#b4c0b8]">
            Se añadirá al inventario con existencias a cero y quedará
            seleccionado.
          </p>

          <label className="block text-sm font-semibold" htmlFor={nameId}>
            Nombre
            <input
              id={nameId}
              name="name"
              type="text"
              required
              maxLength={120}
              placeholder="Por ejemplo, tomates"
              defaultValue={initialName}
              className="mt-2 min-h-12 w-full rounded-xl border border-[#ccd5ca] bg-white px-4 font-normal outline-none transition placeholder:text-[#9aa59e] focus:border-[#1d4f40] focus:ring-2 focus:ring-[#1d4f40]/15 dark:border-white/15 dark:bg-[#10231c]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-sm font-semibold">
              <label htmlFor={unitId}>Unidad base</label>
              <SelectField
                id={unitId}
                name="unit"
                defaultValue="unit"
                options={unitOptions}
                className="mt-2"
              />
            </div>
            <PurchasePlaceField
              id={purchasePlaceId}
              purchasePlaces={purchasePlaces}
            />
          </div>

          {error ? (
            <div className="mt-4">
              <ErrorBanner>{error}</ErrorBanner>
            </div>
          ) : null}
        </div>
      </form>
    </dialog>
  )
}
