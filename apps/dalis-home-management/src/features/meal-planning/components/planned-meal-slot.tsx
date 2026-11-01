import { useCallback } from "react"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import type { DishOption } from "@/features/meal-planning/dish-option"
import type { MealSlotLocation } from "@/features/meal-planning/meal-slot-move"
import type { Dish } from "@/schemas/dish"
import type { MealType } from "@/schemas/weekly-meal-plan"
import { DishNotes } from "./dish-notes"
import { ExecuteMealButton } from "./execute-meal-button"
import { MealSlotDragHandle } from "./meal-slot-drag-handle"
import { MealSlotSelect } from "./meal-slot-select"

interface PlannedMealSlotProps {
  weekStart: string
  date: string
  mealType: MealType
  dish: Dish | null
  isExecuted: boolean
  dishOptions: DishOption[]
  dragDisabled: boolean
  isDragged: boolean
  isDropTarget: boolean
  onDragStart: (source: MealSlotLocation) => void
  onDragMove: (
    source: MealSlotLocation,
    clientX: number,
    clientY: number
  ) => void
  onDragEnd: (
    source: MealSlotLocation,
    clientX: number,
    clientY: number
  ) => void
  onDragCancel: () => void
}

const quantityFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
})

export function PlannedMealSlot({
  weekStart,
  date,
  mealType,
  dish,
  isExecuted,
  dishOptions,
  dragDisabled,
  isDragged,
  isDropTarget,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: PlannedMealSlotProps) {
  const handleDragStart = useCallback(
    () => onDragStart({ date, mealType }),
    [date, mealType, onDragStart]
  )
  const handleDragMove = useCallback(
    (clientX: number, clientY: number) =>
      onDragMove({ date, mealType }, clientX, clientY),
    [date, mealType, onDragMove]
  )
  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) =>
      onDragEnd({ date, mealType }, clientX, clientY),
    [date, mealType, onDragEnd]
  )

  return (
    <div
      data-meal-slot-date={date}
      data-meal-slot-type={mealType}
      className={`min-w-0 rounded-xl transition ${isDragged ? "opacity-45" : "opacity-100"} ${isDropTarget ? "bg-surface outline-2 outline-offset-4 outline-ring" : "outline-transparent"}`}
    >
      <MealSlotSelect
        key={`${mealType}-${dish?.id ?? "empty"}`}
        weekStart={weekStart}
        date={date}
        mealType={mealType}
        dishId={dish?.id ?? null}
        dishes={dishOptions}
        disabled={dragDisabled || isExecuted}
        leadingAction={
          dish && !isExecuted ? (
            <ExecuteMealButton
              weekStart={weekStart}
              date={date}
              mealType={mealType}
              dishName={dish.name}
              disabled={dragDisabled}
            />
          ) : null
        }
        dragHandle={
          dish && !isExecuted ? (
            <MealSlotDragHandle
              dishName={dish.name}
              disabled={dragDisabled}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={onDragCancel}
            />
          ) : null
        }
      />
      {dish ? (
        <details className="group mt-1 rounded-lg bg-surface px-2.5 py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-[0.7rem] font-semibold text-muted focus:outline-none focus:ring-2 focus:ring-ring">
            <span>
              {dish.ingredients.length}{" "}
              {dish.ingredients.length === 1 ? "ingrediente" : "ingredientes"}
            </span>
            <span
              className="text-sm transition group-open:rotate-45"
              aria-hidden="true"
            >
              +
            </span>
          </summary>
          <ul className="mt-1 space-y-1 border-t border-border pt-1 text-xs text-muted">
            {dish.ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex items-baseline justify-between gap-2"
              >
                <span className="min-w-0 truncate">{ingredient.name}</span>
                <span className="shrink-0 font-semibold">
                  {quantityFormatter.format(ingredient.quantity)}{" "}
                  {quantityUnitShortLabels[ingredient.unit]}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <DishNotes notes={dish?.notes} />
    </div>
  )
}
