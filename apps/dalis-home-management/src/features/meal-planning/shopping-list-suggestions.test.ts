import { describe, expect, test } from "bun:test"
import type { Dish } from "@/schemas/dish"
import type { InventoryItem } from "@/schemas/inventory-item"
import type { WeeklyMealPlan } from "@/schemas/weekly-meal-plan"
import { buildMealPlanShoppingSuggestions } from "./shopping-list-suggestions"

const now = new Date("2026-10-02T08:00:00.000Z")
const tomatoId = "507f1f77bcf86cd799439011"
const pastaId = "507f1f77bcf86cd799439013"
const dishId = "507f191e810c19729de860ea"

const dish: Dish = {
  id: dishId,
  name: "Tomato pasta",
  ingredients: [
    {
      id: "ee930dc5-4040-4766-9e03-abc42a47d78f",
      name: "Tomatoes",
      quantity: 3,
      unit: "unit",
      inventoryItemId: tomatoId,
    },
    {
      id: "2b17f5b0-100c-4f53-8994-a456a4094960",
      name: "Pasta",
      quantity: 250,
      unit: "gram",
      inventoryItemId: pastaId,
    },
  ],
  createdAt: now,
  updatedAt: now,
}

const inventory: InventoryItem[] = [
  {
    id: tomatoId,
    name: "Tomatoes",
    quantity: 4,
    unit: "unit",
    purchasePlaces: ["Market"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: pastaId,
    name: "Pasta",
    quantity: 0,
    unit: "gram",
    purchasePlaces: ["Supermarket"],
    createdAt: now,
    updatedAt: now,
  },
]

function createMealPlan(slotCount: number): WeeklyMealPlan {
  return {
    id: "507f1f77bcf86cd799439012",
    weekStart: "2026-09-28",
    slots: Array.from({ length: slotCount }, (_, index) => ({
      date: `2026-10-0${index + 1}`,
      mealType: index % 2 === 0 ? ("lunch" as const) : ("dinner" as const),
      dishId,
      isExecuted: false,
    })),
    createdAt: now,
    updatedAt: now,
  }
}

describe("weekly meal plan shopping suggestions", () => {
  test("aggregates repeated dishes and subtracts linked inventory", () => {
    expect(
      buildMealPlanShoppingSuggestions(createMealPlan(2), [dish], inventory)
    ).toEqual([
      {
        name: "Tomatoes",
        requiredQuantity: 6,
        inventoryQuantity: 4,
        quantity: 2,
        unit: "unit",
        inventoryItemId: tomatoId,
      },
      {
        name: "Pasta",
        requiredQuantity: 500,
        inventoryQuantity: 0,
        quantity: 500,
        unit: "gram",
        inventoryItemId: pastaId,
      },
    ])
  })

  test("includes linked ingredients already covered by inventory", () => {
    expect(
      buildMealPlanShoppingSuggestions(createMealPlan(1), [dish], inventory)
    ).toEqual([
      {
        name: "Tomatoes",
        requiredQuantity: 3,
        inventoryQuantity: 4,
        quantity: 0,
        unit: "unit",
        inventoryItemId: tomatoId,
      },
      {
        name: "Pasta",
        requiredQuantity: 250,
        inventoryQuantity: 0,
        quantity: 250,
        unit: "gram",
        inventoryItemId: pastaId,
      },
    ])
  })

  test("ignores ingredients from executed meals", () => {
    const mealPlan = createMealPlan(1)
    mealPlan.slots = mealPlan.slots.map((slot) => ({
      ...slot,
      isExecuted: true,
    }))

    expect(
      buildMealPlanShoppingSuggestions(mealPlan, [dish], inventory)
    ).toEqual([])
  })

  test("merges ingredients by product and ignores missing dishes", () => {
    const secondDish: Dish = {
      ...dish,
      id: "507f191e810c19729de860eb",
      ingredients: [
        {
          id: "09655f5e-d91e-4e0f-a460-4c09057bc0b2",
          name: " pasta ",
          quantity: 100,
          unit: "gram",
          inventoryItemId: pastaId,
        },
      ],
    }
    const plan = createMealPlan(1)
    plan.slots.push(
      {
        date: "2026-10-02",
        mealType: "dinner",
        dishId: secondDish.id,
        isExecuted: false,
      },
      {
        date: "2026-10-03",
        mealType: "lunch",
        dishId: "507f191e810c19729de860ec",
        isExecuted: false,
      }
    )

    expect(
      buildMealPlanShoppingSuggestions(plan, [dish, secondDish], inventory)
    ).toContainEqual({
      name: "Pasta",
      requiredQuantity: 350,
      inventoryQuantity: 0,
      quantity: 350,
      unit: "gram",
      inventoryItemId: pastaId,
    })
  })
})
