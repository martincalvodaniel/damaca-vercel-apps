"use client"

import type { ReactNode } from "react"
import { useCallback, useState, useTransition } from "react"
import { SelectField } from "@/components/ui/select-field"
import { setWeeklyMealSlotAction } from "@/features/meal-planning/actions"
import type { DishOption } from "@/features/meal-planning/dish-option"
import type { MealType } from "@/schemas/weekly-meal-plan"

interface MealSlotSelectProps {
  weekStart: string
  date: string
  mealType: MealType
  dishId: string | null
  dishes: DishOption[]
  disabled?: boolean
  leadingAction?: ReactNode
  dragHandle?: ReactNode
}

const mealLabels: Record<MealType, string> = {
  lunch: "Comida",
  dinner: "Cena",
}

export function MealSlotSelect({
  weekStart,
  date,
  mealType,
  dishId,
  dishes,
  disabled = false,
  leadingAction,
  dragHandle,
}: MealSlotSelectProps) {
  const [selectedDishId, setSelectedDishId] = useState(dishId ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const label = mealLabels[mealType]
  const dishOptions = [
    { value: "", label: "Sin planificar" },
    ...dishes.map((dish) => ({ value: dish.id, label: dish.name })),
  ]

  const handleChange = useCallback(
    (nextDishId: string) => {
      const previousDishId = selectedDishId
      setSelectedDishId(nextDishId)
      setError(null)

      startTransition(async () => {
        const result = await setWeeklyMealSlotAction({
          weekStart,
          date,
          mealType,
          dishId: nextDishId || null,
        })

        if (!result.success) {
          setSelectedDishId(previousDishId)
          setError(result.message)
        }
      })
    },
    [selectedDishId, weekStart, mealType, date]
  )

  return (
    <div className="min-w-0">
      <div className="mb-1 flex min-h-5 items-center justify-between gap-2">
        <label
          htmlFor={`${date}-${mealType}`}
          className="text-xs font-bold uppercase tracking-[0.12em] text-[#68776e] dark:text-[#afbbb3]"
        >
          {label}
        </label>
        {isPending ? (
          <span className="text-xs font-bold text-[#c36d49]">Guardando…</span>
        ) : null}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {leadingAction}
        <div className="min-w-0 flex-1">
          <SelectField
            id={`${date}-${mealType}`}
            value={selectedDishId}
            onValueChange={handleChange}
            disabled={disabled || isPending}
            options={dishOptions}
            compact
            searchable
            searchPlaceholder="Buscar plato"
            className="min-h-9 border-[#d8ded5] text-sm font-medium text-[#28483d] dark:border-white/10 dark:bg-[#20372f] dark:text-[#f4f1e7]"
          />
        </div>
        {dragHandle}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-[#a34435]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
