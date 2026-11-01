"use client"

import { useCallback, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { restockAndClearPurchasedShoppingListItemsAction } from "@/features/shopping-list/actions"

interface ClearPurchasedButtonProps {
  itemIds: string[]
  disabled?: boolean
}

export function ClearPurchasedButton({
  itemIds,
  disabled = false,
}: ClearPurchasedButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const count = itemIds.length

  const updateInventoryAndClear = useCallback(() => {
    if (disabled) return
    setIsDialogOpen(false)
    setError(null)
    startTransition(async () => {
      try {
        const result =
          await restockAndClearPurchasedShoppingListItemsAction(itemIds)
        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido actualizar el inventario y limpiar la lista.")
      }
    })
  }, [disabled, itemIds])

  const openDialog = useCallback(() => setIsDialogOpen(true), [])

  const closeDialog = useCallback(() => setIsDialogOpen(false), [])

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={openDialog}
        disabled={isPending || disabled}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-wait disabled:opacity-50"
      >
        {isPending ? "Actualizando…" : "Actualizar inventario y limpiar"}
      </button>
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger">{error}</p>
      ) : null}
      <ConfirmationDialog
        open={isDialogOpen}
        title="Actualizar inventario y limpiar"
        description={`Se ${count === 1 ? "sumará el producto visible" : `sumarán los ${count} productos visibles`} al inventario y se eliminará de la lista ${count === 1 ? "el artículo comprado" : "solo esos artículos comprados"}.`}
        confirmLabel="Actualizar y limpiar"
        onConfirm={updateInventoryAndClear}
        onDismiss={closeDialog}
      />
    </div>
  )
}
