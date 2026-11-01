import type { DishOption } from "@/features/meal-planning/dish-option"
import type { MealSlotLocation } from "@/features/meal-planning/meal-slot-move"
import { getMealSlotKey } from "@/features/meal-planning/meal-slot-move"
import type { Dish } from "@/schemas/dish"
import { PlannedMealSlot } from "./planned-meal-slot"

interface MealDayCardProps {
  weekStart: string
  date: string
  today: string
  lunchDish: Dish | null
  dinnerDish: Dish | null
  lunchIsExecuted: boolean
  dinnerIsExecuted: boolean
  dishOptions: DishOption[]
  draggedSlotKey: string | null
  dropTargetKey: string | null
  dragDisabled: boolean
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

const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  timeZone: "UTC",
})

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

export function MealDayCard({
  weekStart,
  date,
  today,
  lunchDish,
  dinnerDish,
  lunchIsExecuted,
  dinnerIsExecuted,
  dishOptions,
  draggedSlotKey,
  dropTargetKey,
  dragDisabled,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: MealDayCardProps) {
  const parsedDate = new Date(`${date}T00:00:00.000Z`)
  const isToday = date === today
  const lunchKey = getMealSlotKey({ date, mealType: "lunch" })
  const dinnerKey = getMealSlotKey({ date, mealType: "dinner" })

  return (
    <article
      className={`min-w-0 rounded-2xl border px-3 py-2 shadow-soft ${
        isToday
          ? "border-primary bg-primary-soft ring-1 ring-ring"
          : "border-border bg-surface"
      }`}
    >
      <header className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="capitalize text-lg font-semibold tracking-[-0.03em]">
            {dayFormatter.format(parsedDate)}
          </h2>
          <p className="shrink-0 text-sm text-muted">
            {dateFormatter.format(parsedDate)}
          </p>
        </div>
        {isToday ? (
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
            Hoy
          </span>
        ) : null}
      </header>

      <div className="space-y-2">
        <PlannedMealSlot
          weekStart={weekStart}
          date={date}
          mealType="lunch"
          dish={lunchDish}
          isExecuted={lunchIsExecuted}
          dishOptions={dishOptions}
          dragDisabled={dragDisabled}
          isDragged={draggedSlotKey === lunchKey}
          isDropTarget={dropTargetKey === lunchKey}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        />
        <PlannedMealSlot
          weekStart={weekStart}
          date={date}
          mealType="dinner"
          dish={dinnerDish}
          isExecuted={dinnerIsExecuted}
          dishOptions={dishOptions}
          dragDisabled={dragDisabled}
          isDragged={draggedSlotKey === dinnerKey}
          isDropTarget={dropTargetKey === dinnerKey}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        />
      </div>
    </article>
  )
}
