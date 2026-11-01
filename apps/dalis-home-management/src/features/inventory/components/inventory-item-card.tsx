"use client"

import { useCallback, useEffect, useState, useTransition } from "react"
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

  const updateQuantity = useCallback(
    (quantity: number) => {
      setError(null)
      setNotice(null)
      onQuantityChange(item, quantity)
    },
    [onQuantityChange, item]
  )

  const markOutOfStock = useCallback(() => {
    setQuantityDraft("0")
    updateQuantity(0)
  }, [updateQuantity])

  const removeItem = useCallback(() => {
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
  }, [item])

  const addToShoppingList = useCallback(() => {
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
  }, [item])

  const editItem = useCallback(() => onEdit(item), [onEdit, item])

  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), [])

  const closeDeleteDialog = useCallback(() => setIsDeleteDialogOpen(false), [])

  return (
    <>
      <article
        className={`min-w-0 max-w-full rounded-2xl border px-4 py-2 transition ${
          isOutOfStock
            ? "border-warning bg-warning-soft"
            : "border-border bg-surface shadow-soft"
        }`}
      >
        <div className="flex min-w-0 items-start justify-between gap-3">
          <p className="min-w-0 truncate text-lg font-semibold tracking-[-0.03em]">
            {item.name}
          </p>
          <QuantityInputStepper
            compact
            value={quantityDraft}
            unit={item.unit}
            minimum={0}
            label={item.name}
            disabled={isPending}
            onValueChange={setQuantityDraft}
            onValueCommit={updateQuantity}
            className="ml-auto w-40 max-w-[60%] shrink-0"
          />
        </div>

        {error || quantityError ? (
          <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error ?? quantityError}
          </p>
        ) : null}
        {notice ? (
          <p
            className="mt-1.5 text-xs font-medium text-success"
            aria-live="polite"
          >
            {notice}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={editItem}
            disabled={isPending || isSavingQuantity}
            className="rounded-full bg-surface px-3.5 py-1 text-xs font-semibold transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            Editar
          </button>
          {isOutOfStock ? (
            <button
              type="button"
              onClick={addToShoppingList}
              disabled={isPending}
              className="rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-on-primary transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-wait disabled:opacity-50"
            >
              {isPending ? "Añadiendo…" : "Añadir a compra"}
            </button>
          ) : null}
          {isOutOfStock ? null : (
            <button
              type="button"
              onClick={markOutOfStock}
              disabled={isPending || isSavingQuantity}
              className="rounded-full border border-border px-3.5 py-1 text-xs font-semibold text-warning transition hover:bg-warning-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              Marcar agotado
            </button>
          )}
          <button
            type="button"
            onClick={openDeleteDialog}
            disabled={isPending || isSavingQuantity}
            className="ml-auto rounded-full px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
        onDismiss={closeDeleteDialog}
      />
    </>
  )
}
