"use client"

import { useState, useTransition } from "react"
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

  function clearList() {
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
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        disabled={itemCount === 0 || isPending}
        className="inline-flex items-center justify-center rounded-full border border-[#d6a996] px-3 py-1.5 text-xs font-semibold text-[#8f5140] transition hover:bg-[#f9e5df] focus:outline-none focus:ring-2 focus:ring-[#a34435] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm dark:border-[#80543d] dark:text-[#e9a995] dark:hover:bg-[#4b2924] dark:ring-offset-[#10221c]"
      >
        {isPending ? "Vaciando…" : "x Limpiar"}
      </button>
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <ConfirmationDialog
        open={isDialogOpen}
        title="Vaciar la lista de la compra"
        description={`Se eliminarán los ${itemCount} ${itemCount === 1 ? "artículo" : "artículos"} de la lista. El inventario no se actualizará y esta acción no se puede deshacer.`}
        confirmLabel="x Limpiar"
        onConfirm={clearList}
        onDismiss={() => setIsDialogOpen(false)}
        tone="danger"
      />
    </div>
  )
}
