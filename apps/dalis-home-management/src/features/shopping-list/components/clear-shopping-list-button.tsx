"use client"

import { useCallback, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { clearShoppingListAction } from "@/features/shopping-list/actions"

interface ClearShoppingListButtonProps {
  itemCount: number
}

export function ClearShoppingListButton({
  itemCount,
}: ClearShoppingListButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const clearList = useCallback(() => {
    setIsDialogOpen(false)
    setError(null)

    startTransition(async () => {
      try {
        const result = await clearShoppingListAction()
        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido vaciar la lista de la compra.")
      }
    })
  }, [])

  const openDialog = useCallback(() => setIsDialogOpen(true), [])

  const closeDialog = useCallback(() => setIsDialogOpen(false), [])

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={openDialog}
        disabled={itemCount === 0 || isPending}
        className="inline-flex items-center justify-center rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm ring-offset-canvas"
      >
        {isPending ? "Vaciando…" : "x Limpiar"}
      </button>
      {error ? (
        <p className="mt-1 text-xs font-medium text-danger">{error}</p>
      ) : null}
      <ConfirmationDialog
        open={isDialogOpen}
        title="Vaciar la lista de la compra"
        description={`Se eliminarán los ${itemCount} ${itemCount === 1 ? "artículo" : "artículos"} de la lista. El inventario no se actualizará y esta acción no se puede deshacer.`}
        confirmLabel="x Limpiar"
        onConfirm={clearList}
        onDismiss={closeDialog}
        tone="danger"
      />
    </div>
  )
}
