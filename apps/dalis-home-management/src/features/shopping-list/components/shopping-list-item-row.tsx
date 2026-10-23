"use client"

import { useEffect, useState, useTransition } from "react"
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

  function togglePurchased() {
    setError(null)
    onTogglePurchased(item)
  }

  function removeItem() {
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
  }

  function updateQuantity(quantity: number) {
    setError(null)
    onQuantityChange(item, quantity)
  }

  return (
    <>
      <article className="relative rounded-2xl border border-[#dde1d8] bg-white/75 p-4 shadow-[0_8px_25px_rgba(50,72,60,0.04)] dark:border-white/10 dark:bg-[#182e26]/80">
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isPending || isSavingPurchase || isSavingQuantity}
          aria-label={`Eliminar ${item.name}`}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[#a75938] transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 dark:text-[#ef9f86] dark:hover:bg-red-950/30 dark:hover:text-red-200"
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
            className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2 disabled:opacity-50 ${
              item.isPurchased
                ? "border-[#76977d] bg-[#76977d] text-white"
                : "border-[#aebcaf] hover:border-[#76977d] hover:bg-[#e7efe5] dark:border-[#789086]"
            }`}
          >
            {item.isPurchased ? "✓" : null}
          </button>

          <div className="min-w-0 flex-1 pr-8">
            <div className="flex min-w-0 items-center gap-2">
              <p
                className={`min-w-0 truncate font-semibold ${item.isPurchased ? "text-[#7f8d85] line-through" : ""}`}
              >
                {item.name}
              </p>
              {item.isMealPlanGenerated ? (
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-full bg-[#f3e8c8] text-[#75611f] dark:bg-[#4b4225] dark:text-[#ead78d]"
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
              value={quantityDraft}
              unit={item.unit}
              minimum={0.01}
              label={item.name}
              disabled={isPending}
              onValueChange={setQuantityDraft}
              onValueCommit={updateQuantity}
              className="mt-3 w-full text-[#41564b] sm:w-56 dark:text-[#d5ded8]"
              buttonClassName="border-[#d8dfd5] bg-[#edf0e9] text-[#5c6e64] hover:bg-[#e1e7de] dark:border-white/10 dark:bg-white/10 dark:text-[#c6d1ca] dark:hover:bg-white/15"
              fieldClassName="border-[#d8dfd5] bg-[#f7f8f5] text-[#41564b] focus-within:border-[#1d4f40] focus-within:ring-[#1d4f40]/15 dark:border-white/10 dark:bg-white/5 dark:text-[#d5ded8]"
            />
            {error || purchaseError || quantityError ? (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-red-700 dark:text-red-300"
              >
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
        onDismiss={() => setIsDeleteDialogOpen(false)}
      />
    </>
  )
}
