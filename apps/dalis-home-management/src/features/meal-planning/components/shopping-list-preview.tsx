"use client"

import Link from "next/link"
import { useCallback, useState, useTransition } from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
import { ModalDialog } from "@/components/ui/modal-dialog"
import {
  getWeeklyShoppingListSuggestionsAction,
  prepareWeeklyShoppingListAction,
} from "@/features/meal-planning/actions"
import type { ShoppingListSuggestion } from "@/features/meal-planning/shopping-list-suggestions"
import { ShoppingListPreviewRow } from "./shopping-list-preview-row"

interface ShoppingListPreviewProps {
  weekStart: string
  suggestions: ShoppingListSuggestion[]
}

export interface EditableShoppingListItem
  extends Omit<ShoppingListSuggestion, "inventoryQuantity" | "quantity"> {
  inventoryQuantity: string
  quantity: string
}

function toEditableItems(
  suggestions: ShoppingListSuggestion[]
): EditableShoppingListItem[] {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    inventoryQuantity: String(suggestion.inventoryQuantity),
    quantity: String(suggestion.quantity),
  }))
}

function roundQuantity(quantity: number): number {
  return Math.round(quantity * 1_000_000) / 1_000_000
}

export function ShoppingListPreview({
  weekStart,
  suggestions,
}: ShoppingListPreviewProps) {
  const [items, setItems] = useState<EditableShoppingListItem[]>(() =>
    toEditableItems(suggestions)
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const openPreview = useCallback(() => {
    setIsOpen(true)
    setIsLoading(true)
    setItems([])
    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      try {
        const result = await getWeeklyShoppingListSuggestionsAction(weekStart)

        if (!result.success) {
          setIsError(true)
          setMessage(result.message)
          return
        }

        setItems(toEditableItems(result.suggestions))
      } catch {
        setIsError(true)
        setMessage("No se ha podido actualizar la vista previa.")
      } finally {
        setIsLoading(false)
      }
    })
  }, [weekStart])

  const updateInventoryQuantity = useCallback(
    (inventoryItemId: string, inventoryQuantity: string) => {
      const parsedInventoryQuantity = Number(inventoryQuantity)
      const normalizedInventoryQuantity = Number.isFinite(
        parsedInventoryQuantity
      )
        ? Math.max(parsedInventoryQuantity, 0)
        : 0
      setMessage(null)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.inventoryItemId === inventoryItemId
            ? {
                ...item,
                inventoryQuantity,
                quantity: String(
                  roundQuantity(
                    Math.max(
                      item.requiredQuantity - normalizedInventoryQuantity,
                      0
                    )
                  )
                ),
              }
            : item
        )
      )
    },
    []
  )

  const updateShoppingQuantity = useCallback(
    (inventoryItemId: string, shoppingQuantity: string) => {
      setMessage(null)
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.inventoryItemId === inventoryItemId
            ? { ...item, quantity: shoppingQuantity }
            : item
        )
      )
    },
    []
  )

  const prepareShoppingList = useCallback(() => {
    setMessage(null)
    setIsError(false)

    startTransition(async () => {
      try {
        const result = await prepareWeeklyShoppingListAction(weekStart, {
          items: items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            inventoryQuantity: Number(item.inventoryQuantity),
            shoppingQuantity: Number(item.quantity),
          })),
        })

        if (!result.success) {
          setIsError(true)
          setMessage(result.message)
          return
        }

        setMessage(
          result.itemCount === 0
            ? "Inventario actualizado. No se ha añadido ningún producto a la lista."
            : `${result.itemCount} ${result.itemCount === 1 ? "producto preparado" : "productos preparados"} en la lista.`
        )
      } catch {
        setIsError(true)
        setMessage("No se han podido guardar los ajustes. Inténtalo de nuevo.")
      }
    })
  }, [weekStart, items])

  const closePreview = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface-raised px-3 py-2 text-left text-ink shadow-soft transition hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-canvas"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold">
            Vista previa de la compra
          </span>
          <span className="grid min-w-6 shrink-0 place-items-center rounded-full bg-field px-1.5 text-xs font-bold tabular-nums leading-6">
            {suggestions.length}
            <span className="sr-only">
              {suggestions.length === 1 ? "producto" : "productos"} por revisar
            </span>
          </span>
        </div>
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-field text-lg"
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <ModalDialog
        open={isOpen}
        ariaLabel="Vista previa de la compra"
        onDismiss={closePreview}
      >
        <section className="flex h-full min-h-0 flex-col bg-surface text-ink">
          <DialogHeader
            title="Vista previa de la compra"
            onDismiss={closePreview}
            cancelLabel="Cerrar"
            cancelDisabled={isPending}
            confirmLabel={isPending ? "Guardando ajustes…" : "Guardar"}
            confirmDisabled={isPending || isLoading || items.length === 0}
            onConfirm={prepareShoppingList}
            pending={isPending}
          />
          <div className="shrink-0 px-4 empty:hidden">
            {message ? (
              <p
                className={`text-sm font-semibold ${isError ? "text-danger" : "text-success"}`}
                role={isError ? "alert" : "status"}
              >
                {message}{" "}
                {!isError ? (
                  <Link
                    href="/shopping-list"
                    className="underline underline-offset-2"
                  >
                    Abrir lista
                  </Link>
                ) : null}
              </p>
            ) : null}
          </div>
          <div className="dialog-content p-4 sm:p-6">
            <p className="mb-3 text-sm text-muted">
              Revisa lo que tienes en casa y ajusta cuánto comprar.
            </p>
            {isLoading ? (
              <p
                className="py-10 text-center text-sm font-semibold text-muted"
                role="status"
              >
                Actualizando la compra…
              </p>
            ) : items.length > 0 ? (
              <>
                <div
                  className="mt-5 mb-2 hidden grid-cols-[minmax(10rem,1fr)_minmax(7rem,0.45fr)_repeat(2,minmax(10rem,0.65fr))] gap-3 px-3 text-xs font-bold uppercase tracking-[0.08em] text-muted lg:grid"
                  aria-hidden="true"
                >
                  <span>Producto</span>
                  <span>Necesitas</span>
                  <span>En inventario</span>
                  <span>Añadir</span>
                </div>

                <ul className="mt-3 grid gap-3 lg:mt-0">
                  {items.map((item) => (
                    <ShoppingListPreviewRow
                      key={item.inventoryItemId}
                      item={item}
                      disabled={isPending}
                      onInventoryQuantityChange={updateInventoryQuantity}
                      onShoppingQuantityChange={updateShoppingQuantity}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-10 text-center text-sm leading-6 text-muted">
                El menú no necesita productos para esta semana.
              </p>
            )}
          </div>
        </section>
      </ModalDialog>
    </>
  )
}
