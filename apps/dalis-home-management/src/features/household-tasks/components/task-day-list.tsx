"use client"

import { type MouseEvent, useCallback } from "react"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"
import { TaskActionButton } from "./task-action-button"
import { TaskDragHandle, type TaskDragPayload } from "./task-drag-handle"
import { formatTaskDate } from "./task-ui"

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
  onToggleComplete,
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
  onToggleComplete: (
    task: HouseholdTask,
    entry: HouseholdTaskOccurrence
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
  const handleToggleComplete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const entry = occurrences.find(
        (candidate) => candidate.id === event.currentTarget.dataset.entry
      )
      const task = tasks.find((candidate) => candidate.id === entry?.taskId)
      if (entry && task) onToggleComplete(task, entry)
    },
    [occurrences, onToggleComplete, tasks]
  )
  const entries = occurrences.filter((entry) => entry.date === date)
  return (
    <section
      aria-label="Tareas del día"
      data-household-drop-date={date}
      className="mt-2 space-y-1.5"
    >
      <h2 className="text-xs font-semibold">{formatTaskDate(date)}</h2>
      {!entries.length ? (
        <p className="rounded-[1.5rem] border border-dashed border-border px-3 py-2 text-xs text-muted">
          No hay tareas para este día.
        </p>
      ) : null}
      {entries.map((entry) => {
        const task = tasks.find((candidate) => candidate.id === entry.taskId)
        if (!task) return null
        return (
          <article
            key={entry.id}
            className="rounded-[1.5rem] border border-border bg-surface px-3 py-2 shadow-soft"
          >
            <div className="flex items-center gap-2">
              <TaskActionButton
                icon="complete"
                label={entry.completedDate ? "Marcar pendiente" : "Completar"}
                intent="toggle-complete"
                entryId={entry.id}
                disabled={disabled || task.archived}
                onClick={handleToggleComplete}
                pressed={Boolean(entry.completedDate)}
                tone={entry.completedDate ? "success" : "default"}
              />
              <div className="min-w-0 flex-1">
                <h3 className="wrap-anywhere text-sm font-semibold tracking-tight">
                  {task.name}
                </h3>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {!entry.completedDate ? (
                  <>
                    <TaskActionButton
                      icon="move"
                      label="Reprogramar"
                      intent="move"
                      entryId={entry.id}
                      disabled={disabled}
                      onClick={handleIntent}
                    />
                    <TaskActionButton
                      icon="delete-execution"
                      label="Cancelar programación"
                      intent="cancel"
                      entryId={entry.id}
                      disabled={disabled}
                      onClick={handleIntent}
                      tone="danger"
                    />
                  </>
                ) : null}
                {!entry.completedDate && !task.archived ? (
                  <TaskDragHandle
                    payload={{ task, occurrence: entry }}
                    disabled={disabled}
                    onDrop={onDrop}
                    onHover={onHover}
                  />
                ) : null}
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
