"use client"

import { useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import { deleteDishAction } from "@/features/meal-planning/actions"
import type { Dish } from "@/schemas/dish"

interface DishCardProps {
  dish: Dish
  onEdit: (dish: Dish) => void
}

const quantityFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
})

export function DishCard({ dish, onEdit }: DishCardProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function removeDish() {
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
  }

  return (
    <>
      <article className="rounded-[1.5rem] border border-[#dedfcf] bg-white/75 p-5 shadow-[0_10px_30px_rgba(50,72,60,0.05)] dark:border-white/10 dark:bg-[#182e26]/80">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold tracking-[-0.035em]">
              {dish.name}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#e5ede3] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#4e6c57] dark:bg-[#29473b] dark:text-[#c3d8c9]">
            {dish.ingredients.length}{" "}
            {dish.ingredients.length === 1 ? "ingrediente" : "ingredientes"}
          </span>
        </div>

        <ul className="mt-5 space-y-2 text-sm text-[#5d6e64] dark:text-[#bac5bd]">
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

        {error ? (
          <p className="mt-3 text-xs font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex gap-2 border-t border-[#e3e6df] pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => onEdit(dish)}
            disabled={isPending}
            className="rounded-full bg-[#edf0e9] px-3.5 py-2 text-xs font-semibold transition hover:bg-[#e1e7de] focus:outline-none focus:ring-2 focus:ring-[#75611f] disabled:opacity-50 dark:bg-white/10"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isPending}
            className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-[#8f5140] transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:opacity-50 dark:text-[#e9a995] dark:hover:bg-red-950/30"
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
        onDismiss={() => setIsDeleteDialogOpen(false)}
      />
    </>
  )
}
