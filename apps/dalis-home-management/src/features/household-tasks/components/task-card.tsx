"use client"

import { type MouseEvent, useCallback } from "react"
import { taskStatus } from "@/features/household-tasks/task-status"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"
import { TaskActionButton } from "./task-action-button"
import { TaskDate } from "./task-date"
import { TaskDragHandle, type TaskDragPayload } from "./task-drag-handle"

export type TaskIntent =
  | "update"
  | "archive"
  | "schedule"
  | "record"
  | "history"
  | "restore"

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
  const warning =
    !task.archived && (status.state === "warning" || status.state === "overdue")
  const dates = [
    { label: "Última", date: status.lastExecution, empty: "Sin ejecutar" },
    { label: "Límite", date: status.dueDate, empty: "Sin calcular" },
    { label: "Programada", date: status.nextScheduled, empty: "Sin fecha" },
  ]
  return (
    <article
      className={`rounded-[1.5rem] border px-3 py-2 shadow-soft sm:px-4 ${warning ? "border-warning bg-warning-soft" : "border-border bg-surface"}`}
    >
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 wrap-anywhere text-sm font-semibold tracking-tight sm:text-base">
          {task.name}
        </h3>
        <span className="shrink-0 rounded-full bg-field px-2 py-0.5 text-[0.6875rem] font-semibold text-muted">
          <span aria-hidden="true">
            {task.intervalDays}d{task.archived ? " · Archivada" : ""}
          </span>
          <span className="sr-only">
            Cada {task.intervalDays} {task.intervalDays === 1 ? "día" : "días"}
            {task.archived ? ", archivada" : ""}
          </span>
        </span>
      </div>
      <dl className="mt-1 grid grid-cols-3 gap-x-2 text-xs leading-4">
        {dates.map(({ label, date, empty }) => (
          <div key={label} className="min-w-0">
            <dt className="text-muted">{label}</dt>
            <dd>{date ? <TaskDate date={date} /> : <span>{empty}</span>}</dd>
          </div>
        ))}
      </dl>
      {warning ? (
        <p className="mt-1 text-xs font-semibold text-warning">
          ⚠{" "}
          {status.state === "overdue"
            ? "Periodicidad vencida"
            : "Límite próximo sin programación a tiempo"}
        </p>
      ) : null}
      <div className="mt-1 flex flex-wrap gap-1 border-t border-border pt-1">
        {task.archived ? (
          <TaskActionButton
            icon="restore"
            label="Restaurar tarea"
            intent="restore"
            disabled={disabled}
            onClick={handleIntent}
            tone="success"
          />
        ) : null}
        {!task.archived ? (
          <>
            <TaskActionButton
              icon="schedule"
              label="Programar"
              intent="schedule"
              disabled={disabled}
              onClick={handleIntent}
            />
            <TaskActionButton
              icon="record"
              label="Registrar ejecución"
              intent="record"
              disabled={disabled}
              onClick={handleIntent}
              tone="success"
            />
            <TaskActionButton
              icon="update"
              label="Editar"
              intent="update"
              disabled={disabled}
              onClick={handleIntent}
            />
          </>
        ) : null}
        <TaskActionButton
          icon="history"
          label="Histórico"
          intent="history"
          disabled={disabled}
          onClick={handleIntent}
        />
        {!task.archived ? (
          <TaskActionButton
            icon="archive"
            label="Archivar"
            intent="archive"
            disabled={disabled}
            onClick={handleIntent}
            tone="danger"
          />
        ) : null}
        {!task.archived ? (
          <span className="ml-auto">
            <TaskDragHandle
              payload={{ task }}
              disabled={disabled}
              onDrop={onDrop}
              onHover={onHover}
            />
          </span>
        ) : null}
      </div>
    </article>
  )
}
