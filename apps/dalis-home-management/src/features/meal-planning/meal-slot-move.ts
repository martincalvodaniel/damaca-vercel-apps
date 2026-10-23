import type { MealType, WeeklyMealSlot } from "@/schemas/weekly-meal-plan"

export interface MealSlotLocation {
  date: string
  mealType: MealType
}

export function getMealSlotKey(slot: MealSlotLocation): string {
  return `${slot.date}:${slot.mealType}`
}

export function moveOrSwapMealSlots(
  slots: readonly WeeklyMealSlot[],
  source: MealSlotLocation,
  destination: MealSlotLocation
): WeeklyMealSlot[] {
  const sourceKey = getMealSlotKey(source)
  const destinationKey = getMealSlotKey(destination)
  const sourceSlot = slots.find((slot) => getMealSlotKey(slot) === sourceKey)

  if (!sourceSlot || sourceKey === destinationKey) {
    return [...slots]
  }

  const destinationSlot = slots.find(
    (slot) => getMealSlotKey(slot) === destinationKey
  )
  const remainingSlots = slots.filter((slot) => {
    const key = getMealSlotKey(slot)
    return key !== sourceKey && key !== destinationKey
  })

  return [
    ...remainingSlots,
    {
      ...destination,
      dishId: sourceSlot.dishId,
      isExecuted: sourceSlot.isExecuted,
    },
    ...(destinationSlot
      ? [
          {
            ...source,
            dishId: destinationSlot.dishId,
            isExecuted: destinationSlot.isExecuted,
          },
        ]
      : []),
  ]
}
