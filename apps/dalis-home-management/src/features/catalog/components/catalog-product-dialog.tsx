"use client"

import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { SelectField } from "@/components/ui/select-field"
import { createCatalogProductAction } from "@/features/catalog/actions"
import { PurchasePlaceField } from "@/features/catalog/components/purchase-place-field"
import type { CatalogProductOption } from "@/features/catalog/product-option"
import { normalizePurchasePlaces } from "@/features/catalog/purchase-places"
import { inventoryUnitLabels } from "@/features/inventory/inventory-options"
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
  const dialogRef = useRef<HTMLDialogElement>(null)
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
  }, [open])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault()
        if (!isPending) {
          onDismiss()
        }
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-[1.75rem] border border-[#d8dfd7] bg-[#fbfaf6] p-0 text-[#17352b] shadow-[0_28px_90px_rgba(10,35,27,0.35)] backdrop:bg-[#0b2119]/65 backdrop:backdrop-blur-sm dark:border-white/15 dark:bg-[#182e26] dark:text-[#f4f1e7]"
    >
      <form className="p-6 sm:p-7" onSubmit={handleSubmit}>
        <header className="sticky -top-6 z-10 -mx-6 -mt-6 border-b border-[#d8dfd7] bg-[#fbfaf6] px-6 pt-6 pb-4 sm:-top-7 sm:-mx-7 sm:-mt-7 sm:px-7 sm:pt-7 dark:border-white/15 dark:bg-[#182e26]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c36d49]">
            Catálogo
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
            Crear producto
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#63736a] dark:text-[#b4c0b8]">
            Se añadirá al inventario con existencias a cero y quedará
            seleccionado.
          </p>
        </header>

        <div className="mt-6 space-y-4">
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
        </div>

        {error ? (
          <div className="mt-4">
            <ErrorBanner>{error}</ErrorBanner>
          </div>
        ) : null}

        <div className="sticky -bottom-6 z-10 -mx-6 -mb-6 mt-7 flex gap-2 border-t border-[#d8dfd7] bg-[#fbfaf6] px-6 py-4 sm:-bottom-7 sm:-mx-7 sm:-mb-7 sm:px-7 dark:border-white/15 dark:bg-[#182e26]">
          <button
            type="button"
            onClick={onDismiss}
            disabled={isPending}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#ccd5ca] px-3 text-sm font-semibold transition hover:bg-[#edf0e9] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:opacity-60 dark:border-white/15 dark:hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#1d4f40] px-3 text-sm font-semibold text-white transition hover:bg-[#173f34] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 dark:ring-offset-[#182e26]"
          >
            {isPending ? "Creando…" : "Crear y seleccionar"}
          </button>
        </div>
      </form>
    </dialog>
  )
}
