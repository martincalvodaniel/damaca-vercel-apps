"use client"

import { type MouseEvent, useCallback } from "react"

import { taskStatus } from "@/features/household-tasks/task-status"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"
import { TaskDragHandle, type TaskDragPayload } from "./task-drag-handle"
import { controlClass, formatTaskDate } from "./task-ui"

export type TaskIntent =
  | "update"
  | "archive"
  | "schedule"
  | "record"
  | "history"

export function TaskCard({
  task,
  occurrences,
  today,
  disabled,
  onIntent,
  onDrop,
  onHover,
}: {
  task: HouseholdTask
  occurrences: HouseholdTaskOccurrence[]
  today: string
  disabled: boolean
  onIntent: (task: HouseholdTask, intent: TaskIntent) => void
  onDrop: (payload: TaskDragPayload, date: string) => void
  onHover: (date: string | null) => void
}) {
  const handleIntent = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onIntent(task, event.currentTarget.dataset.intent as TaskIntent)
    },
    [onIntent, task]
  )
  const status = taskStatus(task.intervalDays, occurrences, today)
  const warning = status.state === "warning" || status.state === "overdue"
  return (
    <article
      className={`rounded-2xl border p-3 ${warning ? "border-warning bg-warning-soft" : "border-border bg-surface"}`}
    >
      <div className="flex items-start gap-3">
        {!task.archived ? (
          <TaskDragHandle
            payload={{ task }}
            disabled={disabled}
            onDrop={onDrop}
            onHover={onHover}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="wrap-anywhere font-semibold">{task.name}</h3>
          <p className="text-sm text-muted">
            Cada {task.intervalDays} {task.intervalDays === 1 ? "día" : "días"}
            {task.archived ? " · Archivada" : ""}
          </p>
          <dl className="mt-2 space-y-1 text-xs text-ink">
            <div>
              <dt className="inline">Última ejecución: </dt>
              <dd className="inline">
                {status.lastExecution
                  ? formatTaskDate(status.lastExecution)
                  : "Sin ejecuciones"}
              </dd>
            </div>
            <div>
              <dt className="inline">Límite: </dt>
              <dd className="inline">
                {status.dueDate
                  ? formatTaskDate(status.dueDate)
                  : "Sin calcular"}
              </dd>
            </div>
            <div>
              <dt className="inline">Programada: </dt>
              <dd className="inline">
                {status.nextScheduled
                  ? formatTaskDate(status.nextScheduled)
                  : "Sin próxima fecha"}
              </dd>
            </div>
          </dl>
          {warning && !task.archived ? (
            <p className="mt-2 text-sm font-semibold text-warning">
              ⚠{" "}
              {status.state === "overdue"
                ? "Periodicidad vencida"
                : "Se acerca el límite sin programación a tiempo"}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!task.archived ? (
          <>
            <button
              type="button"
              disabled={disabled}
              className={controlClass}
              data-intent="schedule"
              onClick={handleIntent}
            >
              Programar
            </button>
            <button
              type="button"
              disabled={disabled}
              className={controlClass}
              data-intent="record"
              onClick={handleIntent}
            >
              Registrar ejecución
            </button>
            <button
              type="button"
              disabled={disabled}
              className={controlClass}
              data-intent="update"
              onClick={handleIntent}
            >
              Editar
            </button>
          </>
        ) : null}
        <button
          type="button"
          disabled={disabled}
          className={controlClass}
          data-intent="history"
          onClick={handleIntent}
        >
          Histórico
        </button>
        {!task.archived ? (
          <button
            type="button"
            disabled={disabled}
            className={`${controlClass} text-danger`}
            data-intent="archive"
            onClick={handleIntent}
          >
            Archivar
          </button>
        ) : null}
      </div>
    </article>
  )
}
