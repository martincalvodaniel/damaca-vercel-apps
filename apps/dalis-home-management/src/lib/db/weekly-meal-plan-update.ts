import "server-only"

import type { Document, ObjectId } from "mongodb"
import type {
  WeeklyMealSlot,
  WeeklyMealSlotInput,
  WeeklyMealSlotMoveInput,
} from "@/schemas/weekly-meal-plan"

export function buildWeeklyMealSlotUpdate(
  input: WeeklyMealSlotInput,
  dishId: ObjectId | null,
  now: Date
): Document[] {
  const remainingSlots = {
    $filter: {
      input: { $ifNull: ["$slots", []] },
      as: "slot",
      cond: {
        $not: [
          {
            $and: [
              { $eq: ["$$slot.date", input.date] },
              { $eq: ["$$slot.mealType", input.mealType] },
            ],
          },
        ],
      },
    },
  }
  const slots = dishId
    ? {
        $concatArrays: [
          remainingSlots,
          [
            {
              date: input.date,
              mealType: input.mealType,
              dishId,
              isExecuted: false,
            },
          ],
        ],
      }
    : remainingSlots

  return [
    {
      $set: {
        weekStart: input.weekStart,
        slots,
        createdAt: { $ifNull: ["$createdAt", now] },
        updatedAt: now,
      },
    },
  ]
}

function buildSlotMatch(
  variableName: string,
  slot: WeeklyMealSlotMoveInput["source"]
) {
  return {
    $and: [
      { $eq: [`$$${variableName}.date`, slot.date] },
      { $eq: [`$$${variableName}.mealType`, slot.mealType] },
    ],
  }
}

export function buildWeeklyMealSlotMoveUpdate(
  input: WeeklyMealSlotMoveInput,
  now: Date
): Document[] {
  const sourceMatch = buildSlotMatch("slot", input.source)
  const destinationMatch = buildSlotMatch("slot", input.destination)

  return [
    {
      $set: {
        slots: {
          $let: {
            vars: { existingSlots: { $ifNull: ["$slots", []] } },
            in: {
              $let: {
                vars: {
                  sourceSlots: {
                    $filter: {
                      input: "$$existingSlots",
                      as: "slot",
                      cond: sourceMatch,
                    },
                  },
                  destinationSlots: {
                    $filter: {
                      input: "$$existingSlots",
                      as: "slot",
                      cond: destinationMatch,
                    },
                  },
                  remainingSlots: {
                    $filter: {
                      input: "$$existingSlots",
                      as: "slot",
                      cond: {
                        $not: [{ $or: [sourceMatch, destinationMatch] }],
                      },
                    },
                  },
                },
                in: {
                  $concatArrays: [
                    "$$remainingSlots",
                    [
                      {
                        date: input.destination.date,
                        mealType: input.destination.mealType,
                        dishId: {
                          $arrayElemAt: ["$$sourceSlots.dishId", 0],
                        },
                        isExecuted: {
                          $ifNull: [
                            { $arrayElemAt: ["$$sourceSlots.isExecuted", 0] },
                            false,
                          ],
                        },
                      },
                    ],
                    {
                      $cond: [
                        { $gt: [{ $size: "$$destinationSlots" }, 0] },
                        [
                          {
                            date: input.source.date,
                            mealType: input.source.mealType,
                            dishId: {
                              $arrayElemAt: ["$$destinationSlots.dishId", 0],
                            },
                            isExecuted: {
                              $ifNull: [
                                {
                                  $arrayElemAt: [
                                    "$$destinationSlots.isExecuted",
                                    0,
                                  ],
                                },
                                false,
                              ],
                            },
                          },
                        ],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        updatedAt: now,
      },
    },
  ]
}

export function buildCopiedWeeklyMealPlanUpdate(
  weekStart: string,
  slots: Array<Omit<WeeklyMealSlot, "dishId"> & { dishId: ObjectId }>,
  now: Date
): Document[] {
  return [
    {
      $set: {
        weekStart,
        slots,
        createdAt: { $ifNull: ["$createdAt", now] },
        updatedAt: now,
      },
    },
  ]
}
