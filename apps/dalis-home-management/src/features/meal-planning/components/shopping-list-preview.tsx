"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
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

  function openPreview() {
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
  }

  function updateInventoryQuantity(
    inventoryItemId: string,
    inventoryQuantity: string
  ) {
    const parsedInventoryQuantity = Number(inventoryQuantity)
    const normalizedInventoryQuantity = Number.isFinite(parsedInventoryQuantity)
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
  }

  function updateShoppingQuantity(
    inventoryItemId: string,
    shoppingQuantity: string
  ) {
    setMessage(null)
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.inventoryItemId === inventoryItemId
          ? { ...item, quantity: shoppingQuantity }
          : item
      )
    )
  }

  function prepareShoppingList() {
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
  }

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="flex min-h-20 w-full items-center justify-between gap-4 rounded-[1.75rem] border border-[#d8d7bd] bg-[#eeeddc] p-4 text-left text-[#303b2d] shadow-[0_18px_50px_rgba(50,72,60,0.08)] transition hover:bg-[#e8e7d3] focus:outline-none focus:ring-2 focus:ring-[#74794f] focus:ring-offset-2 sm:p-5 dark:border-[#59624e] dark:bg-[#2e382b] dark:text-[#f4f3e7] dark:hover:bg-[#374333] dark:ring-offset-[#10221c]"
      >
        <div>
          <p className="text-sm font-semibold">Vista previa de la compra</p>
          <p className="mt-1 text-xs text-[#69705b] dark:text-[#c0c7b5]">
            {suggestions.length === 0
              ? "Actualiza la información antes de preparar la compra"
              : `${suggestions.length} ${suggestions.length === 1 ? "producto" : "productos"} por revisar`}
          </p>
        </div>
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white/60 text-lg dark:bg-white/10"
          aria-hidden="true"
        >
          →
        </span>
      </button>

      <ModalDialog
        open={isOpen}
        ariaLabel="Vista previa de la compra"
        size="xl"
        scrollable={false}
        onDismiss={() => setIsOpen(false)}
      >
        <section className="flex h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[1.75rem] border border-[#d8d7bd] bg-[#eeeddc] p-4 text-[#303b2d] sm:p-5 dark:border-[#59624e] dark:bg-[#2e382b] dark:text-[#f4f3e7]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <header className="-mx-4 -mt-4 border-b border-[#d4d3b9] bg-[#eeeddc] px-4 pt-4 pb-4 sm:-mx-5 sm:-mt-5 sm:px-5 sm:pt-5 dark:border-white/10 dark:bg-[#2e382b]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a75938] dark:text-[#e99a77]">
                Compra de esta semana
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Ajusta inventario y compra
              </h2>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[#69705b] sm:block dark:text-[#c0c7b5]">
                La información se actualiza al abrir esta ventana. Revisa lo que
                tienes en casa; también puedes ajustar manualmente cuánto
                comprar.
              </p>
            </header>

            {isLoading ? (
              <p
                className="py-10 text-center text-sm font-semibold text-[#69705b] dark:text-[#c0c7b5]"
                role="status"
              >
                Actualizando la compra…
              </p>
            ) : items.length > 0 ? (
              <>
                <div
                  className="mt-5 mb-2 hidden grid-cols-[minmax(10rem,1fr)_minmax(7rem,0.45fr)_repeat(2,minmax(10rem,0.65fr))] gap-3 px-3 text-xs font-bold uppercase tracking-[0.08em] text-[#69705b] lg:grid dark:text-[#c0c7b5]"
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
              <p className="py-10 text-center text-sm leading-6 text-[#69705b] dark:text-[#c0c7b5]">
                El menú no necesita productos para esta semana.
              </p>
            )}
          </div>

          <footer className="-mx-4 -mb-4 mt-5 border-t border-[#d4d3b9] bg-[#eeeddc] px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 dark:border-white/10 dark:bg-[#2e382b]">
            {message ? (
              <p
                className={`text-sm font-semibold ${isError ? "text-[#a34435] dark:text-[#ffb4a4]" : "text-[#477052] dark:text-[#a9d6b4]"}`}
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
            <div
              className={`flex gap-2 sm:justify-end ${message ? "mt-4" : ""}`}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#c8cab1] px-5 text-sm font-semibold transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#74794f] disabled:opacity-60 sm:flex-none dark:border-white/15 dark:hover:bg-white/10"
              >
                Cerrar
              </button>
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={prepareShoppingList}
                  disabled={isPending || isLoading}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#a75938] px-5 text-sm font-semibold text-white transition hover:bg-[#8f482d] focus:outline-none focus:ring-2 focus:ring-[#a75938] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 sm:flex-none dark:ring-offset-[#2e382b]"
                >
                  {isPending ? "Guardando ajustes…" : "Guardar"}
                </button>
              ) : null}
            </div>
          </footer>
        </section>
      </ModalDialog>
    </>
  )
}
