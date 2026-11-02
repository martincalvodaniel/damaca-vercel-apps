"use client"

import { type MouseEvent, useCallback } from "react"

import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"
import { TaskDragHandle, type TaskDragPayload } from "./task-drag-handle"
import { controlClass, formatTaskDate } from "./task-ui"

export type OccurrenceIntent =
  | "complete"
  | "move"
  | "cancel"
  | "edit-execution"
  | "delete-execution"

export function TaskDayList({
  date,
  tasks,
  occurrences,
  disabled,
  onIntent,
  onDrop,
  onHover,
}: {
  date: string
  tasks: HouseholdTask[]
  occurrences: HouseholdTaskOccurrence[]
  disabled: boolean
  onIntent: (
    task: HouseholdTask,
    entry: HouseholdTaskOccurrence,
    intent: OccurrenceIntent
  ) => void
  onDrop: (payload: TaskDragPayload, date: string) => void
  onHover: (date: string | null) => void
}) {
  const handleIntent = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const entry = occurrences.find(
        (candidate) => candidate.id === event.currentTarget.dataset.entry
      )
      const task = tasks.find((candidate) => candidate.id === entry?.taskId)
      if (entry && task)
        onIntent(
          task,
          entry,
          event.currentTarget.dataset.intent as OccurrenceIntent
        )
    },
    [occurrences, tasks, onIntent]
  )
  const entries = occurrences.filter((entry) => entry.date === date)
  return (
    <section
      aria-label="Tareas del día"
      data-household-drop-date={date}
      className="mt-4 space-y-3"
    >
      <h2 className="font-semibold">{formatTaskDate(date)}</h2>
      {!entries.length ? (
        <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
          No hay tareas para este día. Arrastra una tarea aquí o usa
          «Programar».
        </p>
      ) : null}
      {entries.map((entry) => {
        const task = tasks.find((candidate) => candidate.id === entry.taskId)
        if (!task) return null
        return (
          <article
            key={entry.id}
            className="rounded-2xl border border-border bg-surface p-3"
          >
            <div className="flex items-center gap-3">
              {!entry.completedDate && !task.archived ? (
                <TaskDragHandle
                  payload={{ task, occurrence: entry }}
                  disabled={disabled}
                  onDrop={onDrop}
                  onHover={onHover}
                />
              ) : null}
              <div className="min-w-0">
                <h3 className="wrap-anywhere font-semibold">{task.name}</h3>
                <p
                  className={`text-sm ${entry.completedDate ? "text-success" : "text-danger"}`}
                >
                  {entry.completedDate
                    ? `✓ Ejecutada el ${formatTaskDate(entry.completedDate)}`
                    : "! Pendiente"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.completedDate ? (
                <>
                  <button
                    type="button"
                    className={controlClass}
                    disabled={disabled}
                    data-entry={entry.id}
                    data-intent="edit-execution"
                    onClick={handleIntent}
                  >
                    Corregir ejecución
                  </button>
                  <button
                    type="button"
                    className={`${controlClass} text-danger`}
                    disabled={disabled}
                    data-entry={entry.id}
                    data-intent="delete-execution"
                    onClick={handleIntent}
                  >
                    Eliminar ejecución
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`${controlClass} text-success`}
                    disabled={disabled}
                    data-entry={entry.id}
                    data-intent="complete"
                    onClick={handleIntent}
                  >
                    Completar
                  </button>
                  <button
                    type="button"
                    className={controlClass}
                    disabled={disabled}
                    data-entry={entry.id}
                    data-intent="move"
                    onClick={handleIntent}
                  >
                    Reprogramar
                  </button>
                  <button
                    type="button"
                    className={`${controlClass} text-danger`}
                    disabled={disabled}
                    data-entry={entry.id}
                    data-intent="cancel"
                    onClick={handleIntent}
                  >
                    Cancelar programación
                  </button>
                </>
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}
