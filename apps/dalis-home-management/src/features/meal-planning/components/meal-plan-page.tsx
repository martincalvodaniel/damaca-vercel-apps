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
    <main className="min-h-screen overflow-x-clip bg-canvas px-4 py-5 text-ink sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-[96rem]">
        <header className="border-b border-border pb-4 sm:pb-2">
          <div className="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-accent sm:block">
                Planificación de casa
              </p>
              <h1 className="mt-2 hidden text-2xl font-semibold tracking-[-0.05em] sm:block sm:text-5xl">
                Menú semanal
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted sm:mt-3 sm:text-base">
                <span>{formatWeekRange(weekStart)}</span>
                <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-field px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">
                  <span aria-hidden="true">{slots.length}/14</span>
                  <span className="sr-only">
                    {slots.length} de 14 comidas planificadas
                  </span>
                </span>
              </p>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <nav
                aria-label="Cambiar semana"
                className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-border bg-field sm:w-auto sm:rounded-xl"
              >
                <Link
                  href={`/meal-plan?week=${previousWeek}`}
                  aria-label="Semana anterior"
                  className="grid min-h-9 min-w-9 place-items-center transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
                >
                  <span aria-hidden="true">←</span>
                </Link>
                <Link
                  href="/meal-plan"
                  className="inline-flex min-h-9 flex-1 items-center justify-center whitespace-nowrap border-x border-border px-2 text-xs font-semibold transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring sm:flex-none sm:px-4 sm:text-sm"
                >
                  Esta semana
                </Link>
                <Link
                  href={`/meal-plan?week=${nextWeek}`}
                  aria-label="Semana siguiente"
                  className="grid min-h-9 min-w-9 place-items-center transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
                >
                  <span aria-hidden="true">→</span>
                </Link>
              </nav>
              <ClearWeekButton
                weekStart={weekStart}
                disabled={slots.length === 0}
              />
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
            <div className="rounded-2xl border border-dashed border-border bg-field px-6 py-12 text-center">
              <h2 className="text-xl font-semibold">Prepara tu primer plato</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Añade platos con sus ingredientes para poder asignarlos a las
                comidas y cenas de la semana.
              </p>
              <Link
                href="/meals"
                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
