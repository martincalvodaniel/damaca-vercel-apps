"use client"

import { useCallback, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import { deleteDishAction } from "@/features/meal-planning/actions"
import type { Dish } from "@/schemas/dish"
import { DishNotes } from "./dish-notes"

interface DishCardProps {
  dish: Dish
  onEdit: (dish: Dish) => void
  onClone: (dish: Dish) => void
}

const quantityFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
})

export function DishCard({ dish, onEdit, onClone }: DishCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const removeDish = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setError(null)
    startTransition(async () => {
      try {
        const result = await deleteDishAction(dish.id)
        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido eliminar el plato.")
      }
    })
  }, [dish.id])

  const editDish = useCallback(() => onEdit(dish), [dish, onEdit])
  const cloneDish = useCallback(() => onClone(dish), [dish, onClone])
  const openDeleteDialog = useCallback(() => setIsDeleteDialogOpen(true), [])
  const closeDeleteDialog = useCallback(() => setIsDeleteDialogOpen(false), [])

  return (
    <>
      <article className="rounded-[1.5rem] border border-border bg-surface px-4 py-2 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold tracking-[-0.035em]">
              {dish.name}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-muted">
            {dish.ingredients.length}{" "}
            {dish.ingredients.length === 1 ? "ingrediente" : "ingredientes"}
          </span>
        </div>

        <ul className="mt-2 space-y-1 text-sm text-muted">
          {dish.ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="min-w-0 truncate">{ingredient.name}</span>
              <span className="shrink-0 font-semibold">
                {quantityFormatter.format(ingredient.quantity)}{" "}
                {quantityUnitShortLabels[ingredient.unit]}
              </span>
            </li>
          ))}
        </ul>

        <DishNotes notes={dish.notes} />

        {error ? (
          <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
        ) : null}

        <div className="mt-2 grid grid-cols-3 items-center gap-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={editDish}
            disabled={isPending}
            className="min-h-8 justify-self-start rounded-full bg-surface px-3.5 py-1 text-xs font-semibold transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={cloneDish}
            disabled={isPending}
            className="min-h-8 justify-self-center rounded-full bg-surface px-3.5 py-1 text-xs font-semibold transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            Clonar
          </button>
          <button
            type="button"
            onClick={openDeleteDialog}
            disabled={isPending}
            className="min-h-8 justify-self-end rounded-full px-3 py-1 text-xs font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </article>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title={`Eliminar ${dish.name}`}
        description="El plato desaparecerá del recetario. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        onConfirm={removeDish}
        onDismiss={closeDeleteDialog}
      />
    </>
  )
}
