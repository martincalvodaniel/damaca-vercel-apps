"use client"

import { useEffect, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { QuantityInputStepper } from "@/components/ui/quantity-input-stepper"
import { deleteInventoryItemAction } from "@/features/inventory/actions"
import { addInventoryItemToShoppingListAction } from "@/features/shopping-list/actions"
import type { InventoryItem } from "@/schemas/inventory-item"

interface InventoryItemCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onQuantityChange: (item: InventoryItem, quantity: number) => void
  isSavingQuantity: boolean
  quantityError: string | null
}

export function InventoryItemCard({
  item,
  onEdit,
  onQuantityChange,
  isSavingQuantity,
  quantityError,
}: InventoryItemCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [quantityDraft, setQuantityDraft] = useState(String(item.quantity))
  const [isPending, startTransition] = useTransition()
  const isOutOfStock = item.quantity === 0

  useEffect(() => {
    setQuantityDraft(String(item.quantity))
  }, [item.quantity])

  function markOutOfStock() {
    setQuantityDraft("0")
    updateQuantity(0)
  }

  function updateQuantity(quantity: number) {
    setError(null)
    setNotice(null)
    onQuantityChange(item, quantity)
  }

  function removeItem() {
    setIsDeleteDialogOpen(false)
    setError(null)
    setNotice(null)
    startTransition(async () => {
      try {
        const result = await deleteInventoryItemAction(item.id)
        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido eliminar el producto.")
      }
    })
  }

  function addToShoppingList() {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      try {
        const result = await addInventoryItemToShoppingListAction(item.id)
        if (!result.success) {
          setError(result.message)
          return
        }

        setNotice("Añadido a la lista. Pulsa de nuevo para sumar otra unidad.")
      } catch {
        setError("No se ha podido añadir el producto a la compra.")
      }
    })
  }

  return (
    <>
      <article
        className={`min-w-0 max-w-full rounded-2xl border p-5 transition ${
          isOutOfStock
            ? "border-[#ead6ca] bg-[#fbede5]/70 dark:border-[#704735] dark:bg-[#412d24]/80"
            : "border-[#dde1d8] bg-white/75 shadow-[0_10px_30px_rgba(50,72,60,0.05)] dark:border-white/10 dark:bg-[#182e26]/80"
        }`}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="min-w-0 truncate text-lg font-semibold tracking-[-0.03em]">
            {item.name}
          </p>
          <QuantityInputStepper
            value={quantityDraft}
            unit={item.unit}
            minimum={0}
            label={item.name}
            disabled={isPending}
            onValueChange={setQuantityDraft}
            onValueCommit={updateQuantity}
            className="ml-auto w-40 max-w-[60%] shrink-0"
            buttonClassName={
              isOutOfStock
                ? "border-[#e7bda8] bg-[#f3cdb9] text-[#7d3e25] hover:bg-[#efbea5] dark:border-[#8a563e] dark:bg-[#754530] dark:text-[#ffe2d2] dark:hover:bg-[#815039]"
                : "border-[#cadcca] bg-[#dce9dc] text-[#365b43] hover:bg-[#d0e3d1] dark:border-[#365d4d] dark:bg-[#294b3e] dark:text-[#cfe2d5] dark:hover:bg-[#315746]"
            }
            fieldClassName={
              isOutOfStock
                ? "border-[#e7bda8] bg-[#fff4ee] text-[#7d3e25] focus-within:border-[#b76543] focus-within:ring-[#b76543]/20 dark:border-[#8a563e] dark:bg-[#4b3025] dark:text-[#ffe2d2]"
                : "border-[#cadcca] bg-[#f4f8f2] text-[#365b43] focus-within:border-[#1d4f40] focus-within:ring-[#1d4f40]/15 dark:border-[#365d4d] dark:bg-[#203a30] dark:text-[#cfe2d5]"
            }
          />
        </div>

        {error || quantityError ? (
          <p
            role="alert"
            className="mt-3 text-xs font-medium text-red-700 dark:text-red-300"
          >
            {error ?? quantityError}
          </p>
        ) : null}
        {notice ? (
          <p
            className="mt-3 text-xs font-medium text-[#3e674b] dark:text-[#b9d4c0]"
            aria-live="polite"
          >
            {notice}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#e3e6df] pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={isPending || isSavingQuantity}
            className="rounded-full bg-[#edf0e9] px-3.5 py-2 text-xs font-semibold transition hover:bg-[#e1e7de] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:opacity-50 dark:bg-white/10 dark:hover:bg-white/15"
          >
            Editar
          </button>
          {isOutOfStock ? (
            <button
              type="button"
              onClick={addToShoppingList}
              disabled={isPending}
              className="rounded-full bg-[#1d4f40] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#173f34] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:cursor-wait disabled:opacity-50"
            >
              {isPending ? "Añadiendo…" : "Añadir a compra"}
            </button>
          ) : null}
          {isOutOfStock ? null : (
            <button
              type="button"
              onClick={markOutOfStock}
              disabled={isPending || isSavingQuantity}
              className="rounded-full border border-[#d8c5b8] px-3.5 py-2 text-xs font-semibold text-[#8b5138] transition hover:bg-[#fae8dd] focus:outline-none focus:ring-2 focus:ring-[#b76543] disabled:opacity-50 dark:border-[#704b39] dark:text-[#efb89e] dark:hover:bg-[#4a3025]"
            >
              Marcar agotado
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isPending || isSavingQuantity}
            className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-[#8f5140] transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 dark:text-[#e9a995] dark:hover:bg-red-950/30"
          >
            Eliminar
          </button>
        </div>
      </article>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title={`Eliminar ${item.name}`}
        description="El producto desaparecerá del inventario. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={removeItem}
        onDismiss={() => setIsDeleteDialogOpen(false)}
      />
    </>
  )
}
