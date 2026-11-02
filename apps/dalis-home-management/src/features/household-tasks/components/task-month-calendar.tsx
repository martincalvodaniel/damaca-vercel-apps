"use client"

import { type MouseEvent, useCallback } from "react"

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
}: {
  selectedDate: string
  today: string
  occurrences: HouseholdTaskOccurrence[]
  hoverDate: string | null
  onSelect: (date: string) => void
  onMonth: (offset: number) => void
}) {
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
      className="rounded-2xl border border-border bg-surface p-3 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 aria-live="polite" className="font-semibold first-letter:uppercase">
          {monthFormatter.format(new Date(`${month}-01T00:00:00Z`))}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className={controlClass}
            aria-label="Mes anterior"
            onClick={previousMonth}
          >
            ‹
          </button>
          <button type="button" className={controlClass} onClick={selectToday}>
            Hoy
          </button>
          <button
            type="button"
            className={controlClass}
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
              aria-label={`${formatTaskDate(date)}. ${description}${date === today ? ". Hoy" : ""}`}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-xl border text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${status === "pending" ? "border-danger bg-danger-soft text-danger" : status === "completed" ? "border-success bg-success-soft text-success" : "border-border bg-field text-ink"} ${date === selectedDate ? "ring-2 ring-ring ring-offset-1 ring-offset-surface" : ""} ${date === hoverDate ? "outline-4 outline-dashed outline-ring" : ""}`}
            >
              <span className="font-semibold">{Number(date.slice(-2))}</span>
              <span aria-hidden="true" className="text-[0.625rem]">
                {status === "empty"
                  ? "\u00a0"
                  : `${status === "completed" ? "✓" : "!"} ${entries.length}`}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted">
        ✓ Verde: todas completas · ! Rojo: alguna pendiente · Sin marca: sin
        tareas
      </p>
    </section>
  )
}
