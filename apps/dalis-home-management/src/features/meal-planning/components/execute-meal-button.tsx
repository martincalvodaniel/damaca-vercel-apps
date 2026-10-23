"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ModalDialog } from "@/components/ui/modal-dialog"
import {
  executeWeeklyMealSlotAction,
  getWeeklyMealExecutionPreviewAction,
} from "@/features/meal-planning/actions"
import type { QuantityUnit } from "@/schemas/quantity-unit"
import type { MealType } from "@/schemas/weekly-meal-plan"
import { MealExecutionInventoryRow } from "./meal-execution-inventory-row"

interface ExecutionInventoryItem {
  inventoryItemId: string
  name: string
  unit: QuantityUnit
  consumedQuantity: number
  initialQuantity: number
  finalQuantity: string
}

interface ExecuteMealButtonProps {
  weekStart: string
  date: string
  mealType: MealType
  dishName: string
  disabled: boolean
}

const mealLabels: Record<MealType, string> = {
  lunch: "comida",
  dinner: "cena",
}

export function ExecuteMealButton({
  weekStart,
  date,
  mealType,
  dishName,
  disabled,
}: ExecuteMealButtonProps) {
  const router = useRouter()
  const [items, setItems] = useState<ExecutionInventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  function openExecutionDialog() {
    setIsOpen(true)
    setIsLoading(true)
    setItems([])
    setError(null)

    startTransition(async () => {
      try {
        const result = await getWeeklyMealExecutionPreviewAction({
          weekStart,
          date,
          mealType,
        })

        if (!result.success) {
          setError(result.message)
          return
        }

        setItems(
          result.items.map((item) => ({
            ...item,
            finalQuantity: String(item.finalQuantity),
          }))
        )
      } catch {
        setError("No se ha podido preparar la ejecución de esta comida.")
      } finally {
        setIsLoading(false)
      }
    })
  }

  function updateFinalQuantity(inventoryItemId: string, quantity: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.inventoryItemId === inventoryItemId
          ? { ...item, finalQuantity: quantity }
          : item
      )
    )
  }

  function executeMeal() {
    setError(null)

    startTransition(async () => {
      try {
        const result = await executeWeeklyMealSlotAction({
          weekStart,
          date,
          mealType,
          items: items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            quantity: Number(item.finalQuantity),
          })),
        })

        if (!result.success) {
          setError(result.message)
          return
        }

        setIsOpen(false)
        router.refresh()
      } catch {
        setError("No se ha podido ejecutar esta comida. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openExecutionDialog}
        disabled={disabled || isPending}
        aria-label={`Marcar ${mealLabels[mealType]} ${dishName} como ejecutada`}
        title="Marcar como ejecutada"
        className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#7ca687] bg-[#eff6ef] text-[#315847] transition hover:bg-[#dcebdd] focus:outline-none focus:ring-2 focus:ring-[#1d6b50] disabled:cursor-wait disabled:opacity-55 dark:border-[#47775a] dark:bg-[#203c2b] dark:text-[#bce3c5] dark:hover:bg-[#294b35]"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-5 fill-none stroke-current stroke-[2.5]"
        >
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      </button>

      <ModalDialog
        open={isOpen}
        ariaLabel={`Ejecutar ${mealLabels[mealType]} ${dishName}`}
        size="lg"
        scrollable={false}
        onDismiss={() => setIsOpen(false)}
      >
        <section className="flex h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[1.75rem] border border-[#d8d7bd] bg-[#eeeddc] p-4 text-[#303b2d] sm:p-5 dark:border-[#59624e] dark:bg-[#2e382b] dark:text-[#f4f3e7]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <header className="-mx-4 -mt-4 border-b border-[#d4d3b9] bg-[#eeeddc] px-4 pt-4 pb-4 sm:-mx-5 sm:-mt-5 sm:px-5 sm:pt-5 dark:border-white/10 dark:bg-[#2e382b]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#477052] dark:text-[#a9d6b4]">
                Ejecutar {mealLabels[mealType]}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                {dishName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#69705b] dark:text-[#c0c7b5]">
                Revisa y ajusta el inventario que quedará tras preparar esta
                comida.
              </p>
            </header>

            {isLoading ? (
              <p
                className="py-10 text-center text-sm font-semibold text-[#69705b] dark:text-[#c0c7b5]"
                role="status"
              >
                Preparando el inventario…
              </p>
            ) : items.length > 0 ? (
              <ul className="mt-3 grid gap-3">
                {items.map((item) => (
                  <MealExecutionInventoryRow
                    key={item.inventoryItemId}
                    item={item}
                    disabled={isPending}
                    onFinalQuantityChange={updateFinalQuantity}
                  />
                ))}
              </ul>
            ) : null}
          </div>

          <footer className="-mx-4 -mb-4 mt-5 border-t border-[#d4d3b9] bg-[#eeeddc] px-4 py-4 sm:-mx-5 sm:-mb-5 sm:px-5 dark:border-white/10 dark:bg-[#2e382b]">
            {error ? (
              <p
                className="text-sm font-semibold text-[#a34435] dark:text-[#ffb4a4]"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <div className={`flex gap-2 sm:justify-end ${error ? "mt-4" : ""}`}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#c8cab1] px-5 text-sm font-semibold transition hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#74794f] disabled:opacity-60 sm:flex-none dark:border-white/15 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeMeal}
                disabled={isLoading || isPending || items.length === 0}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#477052] px-5 text-sm font-semibold text-white transition hover:bg-[#385e43] focus:outline-none focus:ring-2 focus:ring-[#477052] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 sm:flex-none dark:ring-offset-[#2e382b]"
              >
                {isPending ? "Preparando…" : "Confirmar"}
              </button>
            </div>
          </footer>
        </section>
      </ModalDialog>
    </>
  )
}
