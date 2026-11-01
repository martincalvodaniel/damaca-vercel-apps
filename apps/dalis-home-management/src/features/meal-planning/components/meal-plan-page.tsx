import Link from "next/link"
import type { DishOption } from "@/features/meal-planning/dish-option"
import type { ShoppingListSuggestion } from "@/features/meal-planning/shopping-list-suggestions"
import type { Dish } from "@/schemas/dish"
import {
  addDaysToIsoDate,
  type WeeklyMealSlot,
} from "@/schemas/weekly-meal-plan"
import { ClearWeekButton } from "./clear-week-button"
import { CopyPreviousWeekButton } from "./copy-previous-week-button"
import { ShoppingListPreview } from "./shopping-list-preview"
import { WeeklyMealCalendar } from "./weekly-meal-calendar"

interface MealPlanPageProps {
  weekStart: string
  today: string
  slots: WeeklyMealSlot[]
  dishes: Dish[]
  shoppingSuggestions: ShoppingListSuggestion[]
}

const weekDateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

function formatWeekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`)
  const end = new Date(`${addDaysToIsoDate(weekStart, 6)}T00:00:00.000Z`)

  return `${weekDateFormatter.format(start)} — ${weekDateFormatter.format(end)}`
}

export function MealPlanPage({
  weekStart,
  today,
  slots,
  dishes,
  shoppingSuggestions,
}: MealPlanPageProps) {
  const previousWeek = addDaysToIsoDate(weekStart, -7)
  const nextWeek = addDaysToIsoDate(weekStart, 7)
  const dishOptions: DishOption[] = dishes.map(({ id, name }) => ({
    id,
    name,
  }))

  return (
    <main className="min-h-screen overflow-x-clip bg-[#f5f4ee] px-4 py-5 text-[#17352b] sm:px-8 sm:py-8 dark:bg-[#10221c] dark:text-[#f4f1e7]">
      <div className="mx-auto w-full max-w-[96rem]">
        <header className="border-b border-[#d9ded3] pb-4 sm:pb-2 dark:border-white/10">
          <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="sr-only">Planificación de casa</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] sm:sr-only">
                Menú semanal
              </h1>
              <p className="mt-1 text-xs text-[#63736a] sm:mt-0 sm:text-base dark:text-[#b4c0b8]">
                {formatWeekRange(weekStart)} · {slots.length} de 14 comidas
                planificadas
              </p>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <nav
                aria-label="Cambiar semana"
                className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-[#ccd5ce] bg-white/70 sm:w-auto sm:rounded-xl dark:border-white/15 dark:bg-white/5"
              >
                <Link
                  href={`/meal-plan?week=${previousWeek}`}
                  aria-label="Semana anterior"
                  className="grid min-h-9 min-w-9 place-items-center transition hover:bg-[#e8ece6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d4f40] dark:hover:bg-white/10"
                >
                  <span aria-hidden="true">←</span>
                </Link>
                <Link
                  href="/meal-plan"
                  className="inline-flex min-h-9 flex-1 items-center justify-center whitespace-nowrap border-x border-[#ccd5ce] px-2 text-xs font-semibold transition hover:bg-[#e8ece6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d4f40] sm:flex-none sm:px-4 sm:text-sm dark:border-white/15 dark:hover:bg-white/10"
                >
                  Esta semana
                </Link>
                <Link
                  href={`/meal-plan?week=${nextWeek}`}
                  aria-label="Semana siguiente"
                  className="grid min-h-9 min-w-9 place-items-center transition hover:bg-[#e8ece6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1d4f40] dark:hover:bg-white/10"
                >
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
              {slots.length > 0 ? (
                <ClearWeekButton weekStart={weekStart} />
              ) : null}
            </div>
          </div>
        </header>

        <section
          className="space-y-2 py-2"
          aria-label="Comidas y cenas de la semana"
        >
          {slots.length === 0 && dishes.length > 0 ? (
            <CopyPreviousWeekButton weekStart={weekStart} />
          ) : null}
          {slots.length > 0 ? (
            <ShoppingListPreview
              key={weekStart}
              weekStart={weekStart}
              suggestions={shoppingSuggestions}
            />
          ) : null}
          {dishes.length > 0 ? (
            <WeeklyMealCalendar
              weekStart={weekStart}
              today={today}
              slots={slots}
              dishes={dishes}
              dishOptions={dishOptions}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#bdc8bf] bg-white/55 px-6 py-12 text-center dark:border-white/15 dark:bg-white/5">
              <h2 className="text-xl font-semibold">Prepara tu primer plato</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#63736a] dark:text-[#b4c0b8]">
                Añade platos con sus ingredientes para poder asignarlos a las
                comidas y cenas de la semana.
              </p>
              <Link
                href="/meals"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#1d4f40] px-5 text-sm font-semibold text-white transition hover:bg-[#173f34] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2"
              >
                Añadir un plato
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
