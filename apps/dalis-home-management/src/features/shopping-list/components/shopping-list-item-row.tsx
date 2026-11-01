"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { deleteShoppingListItemAction } from "@/features/shopping-list/actions"
import type { ShoppingListItem } from "@/schemas/shopping-list-item"

interface ShoppingListItemRowProps {
  item: ShoppingListItem
  onTogglePurchased: (item: ShoppingListItem) => void
  isSavingPurchase: boolean
  purchaseError: string | null
  onQuantityChange: (item: ShoppingListItem, quantity: number) => void
  isSavingQuantity: boolean
  quantityError: string | null
}

export function ShoppingListItemRow({
  item,
  onTogglePurchased,
  isSavingPurchase,
  purchaseError,
  onQuantityChange,
  isSavingQuantity,
  quantityError,
}: ShoppingListItemRowProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [quantityDraft, setQuantityDraft] = useState(String(item.quantity))
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setQuantityDraft(String(item.quantity))
  }, [item.quantity])

  const togglePurchased = useCallback(() => {
    setError(null)
    onTogglePurchased(item)
  }, [onTogglePurchased, item])

  const removeItem = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setError(null)
    startTransition(async () => {
      try {
        const result = await deleteShoppingListItemAction(item.id)
        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido eliminar el producto.")
      }
    })
  }, [item])

  const updateQuantity = useCallback(
    (quantity: number) => {
      setError(null)
      onQuantityChange(item, quantity)
    },
    [onQuantityChange, item]
  )

  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), [])

  const closeDeleteDialog = useCallback(() => setIsDeleteDialogOpen(false), [])

  return (
    <>
      <article className="relative rounded-2xl border border-border bg-surface px-4 py-2 shadow-soft">
        <button
          type="button"
          onClick={openDeleteDialog}
          disabled={isPending || isSavingPurchase || isSavingQuantity}
          aria-label={`Eliminar ${item.name}`}
          className="absolute top-2 right-3 grid size-8 place-items-center rounded-full text-danger transition hover:bg-danger-soft hover:text-danger focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={togglePurchased}
            disabled={isPending}
            aria-pressed={item.isPurchased}
            aria-label={
              item.isPurchased
                ? `Marcar ${item.name} como pendiente`
                : `Marcar ${item.name} como comprado`
            }
            className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 ${
              item.isPurchased
                ? "border-border bg-success text-on-success"
                : "border-control-border hover:border-primary hover:bg-primary-soft"
            }`}
          >
            {item.isPurchased ? "✓" : null}
          </button>

          <div className="min-w-0 flex-1 pr-8">
            <div className="flex min-w-0 items-center gap-2">
              <p
                className={`min-w-0 truncate font-semibold ${item.isPurchased ? "text-muted line-through" : ""}`}
              >
                {item.name}
              </p>
              {item.isMealPlanGenerated ? (
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
                  title="Menú semanal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Añadido desde el menú semanal"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 3v3M17 3v3M4 9h16" />
                    <rect x="4" y="5" width="16" height="15" rx="2" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                </span>
              ) : null}
            </div>
            <QuantityInputStepper
              compact
              value={quantityDraft}
              unit={item.unit}
              minimum={0.01}
              label={item.name}
              disabled={isPending}
              onValueChange={setQuantityDraft}
              onValueCommit={updateQuantity}
              className="mt-1.5 w-full text-ink sm:w-56"
            />
            {error || purchaseError || quantityError ? (
              <p role="alert" className="mt-2 text-xs font-medium text-danger">
                {error ?? quantityError ?? purchaseError}
              </p>
            ) : null}
          </div>
        </div>
      </article>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title={`Eliminar ${item.name}`}
        description="El producto desaparecerá de la lista de la compra. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={removeItem}
        onDismiss={closeDeleteDialog}
      />
    </>
  )
}
