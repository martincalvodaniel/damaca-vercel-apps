"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
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

  const openExecutionDialog = useCallback(() => {
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
  }, [date, weekStart, mealType])

  const updateFinalQuantity = useCallback(
    (inventoryItemId: string, quantity: string) => {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.inventoryItemId === inventoryItemId
            ? { ...item, finalQuantity: quantity }
            : item
        )
      )
    },
    []
  )

  const executeMeal = useCallback(() => {
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
  }, [items, router, mealType, weekStart, date])

  const closeDialog = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <button
        type="button"
        onClick={openExecutionDialog}
        disabled={disabled || isPending}
        aria-label={`Marcar ${mealLabels[mealType]} ${dishName} como ejecutada`}
        title="Marcar como ejecutada"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-accent-soft text-ink transition hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-wait disabled:opacity-55"
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
        onDismiss={closeDialog}
      >
        <section className="flex h-full min-h-0 flex-col bg-surface text-ink">
          <DialogHeader
            title={`Ejecutar ${mealLabels[mealType]}: ${dishName}`}
            onDismiss={closeDialog}
            cancelDisabled={isPending}
            confirmLabel={isPending ? "Preparando…" : "Confirmar"}
            confirmDisabled={isLoading || isPending || items.length === 0}
            onConfirm={executeMeal}
            pending={isPending}
          />
          {error ? (
            <p
              className="shrink-0 px-4 py-2 text-sm font-semibold text-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="dialog-content p-4 sm:p-6">
            <p className="mb-3 text-sm text-muted">
              Revisa y ajusta el inventario que quedará tras preparar esta
              comida.
            </p>
            {isLoading ? (
              <p
                className="py-10 text-center text-sm font-semibold text-muted"
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
        </section>
      </ModalDialog>
    </>
  )
}
