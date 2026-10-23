"use client"

import { useOptimistic, useState, useTransition } from "react"
import { moveWeeklyMealSlotAction } from "@/features/meal-planning/actions"
import type { DishOption } from "@/features/meal-planning/dish-option"
import {
  getMealSlotKey,
  type MealSlotLocation,
  moveOrSwapMealSlots,
} from "@/features/meal-planning/meal-slot-move"
import type { Dish } from "@/schemas/dish"
import type { WeeklyMealSlot } from "@/schemas/weekly-meal-plan"
import { getWeekDates } from "@/schemas/weekly-meal-plan"
import { MealDayCard } from "./meal-day-card"

interface WeeklyMealCalendarProps {
  weekStart: string
  today: string
  slots: WeeklyMealSlot[]
  dishes: Dish[]
  dishOptions: DishOption[]
}

interface MealSlotMove {
  source: MealSlotLocation
  destination: MealSlotLocation
}

function findMealSlotAtPoint(
  clientX: number,
  clientY: number
): MealSlotLocation | null {
  const element = document
    .elementFromPoint(clientX, clientY)
    ?.closest<HTMLElement>("[data-meal-slot-date][data-meal-slot-type]")
  const date = element?.dataset.mealSlotDate
  const mealType = element?.dataset.mealSlotType

  if (!date || (mealType !== "lunch" && mealType !== "dinner")) {
    return null
  }

  return { date, mealType }
}

export function WeeklyMealCalendar({
  weekStart,
  today,
  slots,
  dishes,
  dishOptions,
}: WeeklyMealCalendarProps) {
  const [optimisticSlots, moveOptimistically] = useOptimistic(
    slots,
    (currentSlots, move: MealSlotMove) =>
      moveOrSwapMealSlots(currentSlots, move.source, move.destination)
  )
  const [draggedSlotKey, setDraggedSlotKey] = useState<string | null>(null)
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dishesById = new Map(dishes.map((dish) => [dish.id, dish]))
  const slotsByKey = new Map(
    optimisticSlots.map((slot) => [getMealSlotKey(slot), slot])
  )

  function resetDragState() {
    setDraggedSlotKey(null)
    setDropTargetKey(null)
  }

  function handleDragStart(source: MealSlotLocation) {
    setError(null)
    setDraggedSlotKey(getMealSlotKey(source))
  }

  function handleDragMove(
    source: MealSlotLocation,
    clientX: number,
    clientY: number
  ) {
    const destination = findMealSlotAtPoint(clientX, clientY)
    const destinationKey = destination ? getMealSlotKey(destination) : null

    setDropTargetKey(
      destinationKey === getMealSlotKey(source) ? null : destinationKey
    )
  }

  function handleDragEnd(
    source: MealSlotLocation,
    clientX: number,
    clientY: number
  ) {
    const destination = findMealSlotAtPoint(clientX, clientY)
    resetDragState()

    if (
      !destination ||
      getMealSlotKey(destination) === getMealSlotKey(source)
    ) {
      return
    }

    setError(null)
    startTransition(async () => {
      moveOptimistically({ source, destination })
      try {
        const result = await moveWeeklyMealSlotAction({
          weekStart,
          source,
          destination,
        })

        if (!result.success) {
          setError(result.message)
        }
      } catch {
        setError("No se ha podido guardar el movimiento. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <div>
      <div className="mb-3 flex min-h-5 flex-col items-start gap-1.5 px-1 text-xs leading-5 text-[#68776e] sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:text-[#afbbb3]">
        <p className="min-w-0">
          Arrastra desde el asa ⠿ para mover o intercambiar platos, o usa los
          selectores.
        </p>
        {isPending ? (
          <p className="shrink-0 font-semibold text-[#c36d49]" role="status">
            Moviendo…
          </p>
        ) : null}
      </div>
      {error ? (
        <p
          className="mb-3 rounded-xl bg-[#f9e5df] px-3 py-2 text-sm font-medium text-[#a34435] dark:bg-[#4b2924] dark:text-[#ffb4a4]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {getWeekDates(weekStart).map((date) => {
          const lunchSlot = slotsByKey.get(`${date}:lunch`)
          const dinnerSlot = slotsByKey.get(`${date}:dinner`)

          return (
            <MealDayCard
              key={date}
              weekStart={weekStart}
              date={date}
              today={today}
              lunchDish={
                lunchSlot ? (dishesById.get(lunchSlot.dishId) ?? null) : null
              }
              dinnerDish={
                dinnerSlot ? (dishesById.get(dinnerSlot.dishId) ?? null) : null
              }
              lunchIsExecuted={lunchSlot?.isExecuted ?? false}
              dinnerIsExecuted={dinnerSlot?.isExecuted ?? false}
              dishOptions={dishOptions}
              draggedSlotKey={draggedSlotKey}
              dropTargetKey={dropTargetKey}
              dragDisabled={isPending}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={resetDragState}
            />
          )
        })}
      </div>
    </div>
  )
}
