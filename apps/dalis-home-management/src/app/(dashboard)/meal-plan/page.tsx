import type { Metadata } from "next"
import { MealPlanPage } from "@/features/meal-planning/components/meal-plan-page"
import { buildMealPlanShoppingSuggestions } from "@/features/meal-planning/shopping-list-suggestions"
import {
  getCurrentWeekStart,
  getMadridIsoDate,
} from "@/features/meal-planning/week-utils"
import { listDishes } from "@/lib/db/dishes"
import { listInventoryItems } from "@/lib/db/inventory-items"
import { findWeeklyMealPlan } from "@/lib/db/weekly-meal-plans"
import { weekStartSchema } from "@/schemas/weekly-meal-plan"

export const metadata: Metadata = {
  title: "Menú semanal — Dali",
  description: "Calendario semanal de comidas y cenas de Dani y Pali.",
}

interface MealPlanRouteProps {
  searchParams: Promise<{ week?: string | string[] }>
}

export default async function MealPlanRoute({
  searchParams,
}: MealPlanRouteProps) {
  const params = await searchParams
  const requestedWeek = Array.isArray(params.week)
    ? params.week[0]
    : params.week
  const parsedWeek = weekStartSchema.safeParse(requestedWeek)
  const weekStart = parsedWeek.success ? parsedWeek.data : getCurrentWeekStart()
  const [dishes, mealPlan, inventoryItems] = await Promise.all([
    listDishes(),
    findWeeklyMealPlan(weekStart),
    listInventoryItems(),
  ])
  const shoppingSuggestions = mealPlan
    ? buildMealPlanShoppingSuggestions(mealPlan, dishes, inventoryItems)
    : []

  return (
    <MealPlanPage
      weekStart={weekStart}
      today={getMadridIsoDate()}
      slots={mealPlan?.slots ?? []}
      dishes={dishes}
      shoppingSuggestions={shoppingSuggestions}
    />
  )
}
