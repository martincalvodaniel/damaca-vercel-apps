"use client"

import { type MouseEvent, type TouchEvent, useCallback, useRef } from "react"

import { dayStatus, monthDays } from "@/features/household-tasks/task-status"
import type { HouseholdTaskOccurrence } from "@/types/household-task"
import { controlClass, formatTaskDate } from "./task-ui"

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export function TaskMonthCalendar({
  selectedDate,
  today,
  occurrences,
  hoverDate,
  onSelect,
  onMonth,
  ghosts,
}: {
  selectedDate: string
  today: string
  occurrences: HouseholdTaskOccurrence[]
  hoverDate: string | null
  onSelect: (date: string) => void
  onMonth: (offset: number) => void
  ghosts: Array<{ date: string }>
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const startSwipe = useCallback((event: TouchEvent<HTMLElement>) => {
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    }
  }, [])
  const endSwipe = useCallback(
    (event: TouchEvent<HTMLElement>) => {
      const start = touchStart.current
      touchStart.current = null
      if (!start) return
      const dx = event.changedTouches[0].clientX - start.x
      const dy = event.changedTouches[0].clientY - start.y
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
        onMonth(dx < 0 ? 1 : -1)
    },
    [onMonth]
  )
  const previousMonth = useCallback(() => onMonth(-1), [onMonth])
  const nextMonth = useCallback(() => onMonth(1), [onMonth])
  const selectToday = useCallback(() => onSelect(today), [onSelect, today])
  const selectDate = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const date = event.currentTarget.dataset.householdDropDate
      if (date) onSelect(date)
    },
    [onSelect]
  )
  const month = selectedDate.slice(0, 7)
  const entriesByDate = new Map<string, HouseholdTaskOccurrence[]>()
  for (const entry of occurrences) {
    const list = entriesByDate.get(entry.date) ?? []
    list.push(entry)
    entriesByDate.set(entry.date, list)
  }
  return (
    <section
      aria-label="Calendario de tareas"
      onTouchStart={startSwipe}
      onTouchEnd={endSwipe}
      className="rounded-[1.5rem] border border-border bg-surface p-2 sm:p-3"
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2
          aria-live="polite"
          className="text-sm font-semibold first-letter:uppercase"
        >
          {monthFormatter.format(new Date(`${month}-01T00:00:00Z`))}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className={`${controlClass} min-w-8 px-2`}
            aria-label="Mes anterior"
            onClick={previousMonth}
          >
            ‹
          </button>
          <button
            type="button"
            className={`${controlClass} min-w-8 px-2`}
            onClick={selectToday}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`${controlClass} min-w-8 px-2`}
            aria-label="Mes siguiente"
            onClick={nextMonth}
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <span
            key={day}
            className="pb-1 text-center text-xs font-semibold text-muted"
          >
            {day}
          </span>
        ))}
        {monthDays(month).map((date, index) => {
          if (!date) return <span key={weekdays[index]} />
          const entries = entriesByDate.get(date) ?? []
          const status = dayStatus(entries)
          const ghostCount = ghosts.filter(
            (ghost) => ghost.date === date
          ).length
          const description =
            status === "pending"
              ? "Tareas pendientes"
              : status === "completed"
                ? "Todas completadas"
                : "Sin tareas"
          return (
            <button
              type="button"
              key={date}
              data-household-drop-date={date}
              onClick={selectDate}
              aria-pressed={date === selectedDate}
              aria-current={date === today ? "date" : undefined}
              aria-label={`${formatTaskDate(date)}. ${description}${ghostCount ? `. ${ghostCount} tareas sugeridas sin programar` : ""}${date === today ? ". Hoy" : ""}`}
              className={`flex min-h-9 min-w-0 flex-col items-center justify-center rounded-lg border text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${status === "pending" ? "border-danger bg-danger-soft text-danger" : status === "completed" ? "border-success bg-success-soft text-success" : "border-border bg-field text-ink"} ${date === selectedDate ? "ring-2 ring-ring ring-offset-1 ring-offset-surface" : ""} ${date === hoverDate ? "outline-4 outline-dashed outline-ring" : ""}`}
            >
              <span className="font-semibold">{Number(date.slice(-2))}</span>
              {ghostCount ? (
                <span className="rounded bg-warning-soft px-1 text-warning">
                  ⚠ {ghostCount}
                </span>
              ) : null}
              <span aria-hidden="true" className="text-[0.625rem]">
                {status === "empty"
                  ? "\u00a0"
                  : `${status === "completed" ? "✓" : "!"} ${entries.length}`}
              </span>
            </button>
          )
        })}
      </div>
      <p className="sr-only text-xs text-muted sm:not-sr-only sm:mt-2">
        ✓ Verde: todas completas · ! Rojo: alguna pendiente · Sin marca: sin
        tareas
      </p>
    </section>
  )
}
