"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { householdTaskAction } from "@/features/household-tasks/actions"
import { getMadridIsoDate } from "@/features/meal-planning/week-utils"
import type { HouseholdTaskCommand } from "@/schemas/household-task"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
  HouseholdTasksData,
} from "@/types/household-task"
import { TaskCard, type TaskIntent } from "./task-card"
import { type OccurrenceIntent, TaskDayList } from "./task-day-list"
import { TaskDialog, type TaskDialogState } from "./task-dialog"
import type { TaskDragPayload } from "./task-drag-handle"
import { TaskMonthCalendar } from "./task-month-calendar"
import { controlClass, primaryClass } from "./task-ui"

export function HouseholdTasksBoard({
  data,
  initialToday,
}: {
  data: HouseholdTasksData
  initialToday: string
}) {
  const router = useRouter()
  const [today, setToday] = useState(initialToday)
  const [selectedDate, setSelectedDate] = useState(initialToday)
  const [showArchived, setShowArchived] = useState(false)
  const [dialog, setDialog] = useState<TaskDialogState | null>(null)
  const [returnHistory, setReturnHistory] = useState<HouseholdTask | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  useEffect(() => {
    const update = () => setToday(getMadridIsoDate())
    const timer = window.setInterval(update, 60_000)
    document.addEventListener("visibilitychange", update)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
    }
  }, [])
  const dismiss = useCallback(() => {
    if (pending) return
    setError(null)
    if (returnHistory) {
      setDialog({
        kind: "history",
        task: returnHistory,
        requestId: crypto.randomUUID(),
      })
      setReturnHistory(null)
    } else setDialog(null)
  }, [pending, returnHistory])

  const run = useCallback(
    (command: HouseholdTaskCommand, closeDialog = true) => {
      if (pending) return
      setError(null)
      startTransition(async () => {
        try {
          const result = await householdTaskAction(command)
          if (!result.success) {
            setError(result.message)
            return
          }
          if (closeDialog) {
            if (returnHistory) {
              setDialog({
                kind: "history",
                task: returnHistory,
                requestId: crypto.randomUUID(),
              })
              setReturnHistory(null)
            } else setDialog(null)
          }
          router.refresh()
        } catch {
          setError(
            "No se ha podido confirmar el cambio. Recarga para comprobar el estado antes de reintentarlo."
          )
        }
      })
    },
    [pending, returnHistory, router]
  )
  const openTask = useCallback((task: HouseholdTask, kind: TaskIntent) => {
    setError(null)
    setDialog({ kind, task, requestId: crypto.randomUUID() })
  }, [])
  const drop = useCallback(
    (payload: TaskDragPayload, date: string) => {
      setSelectedDate(date)
      const command: HouseholdTaskCommand = payload.occurrence
        ? {
            kind: "move",
            taskId: payload.task.id,
            occurrenceId: payload.occurrence.id,
            expectedDate: payload.occurrence.date,
            date,
          }
        : {
            kind: "schedule",
            taskId: payload.task.id,
            occurrenceId: crypto.randomUUID(),
            date,
          }
      run(command, false)
    },
    [run]
  )
  const changeMonth = useCallback(
    (offset: number) => {
      const value = new Date(`${selectedDate.slice(0, 7)}-01T00:00:00Z`)
      value.setUTCMonth(value.getUTCMonth() + offset)
      const date = value.toISOString().slice(0, 10)
      if (date >= "1900-01-01" && date <= "2199-12-31") setSelectedDate(date)
    },
    [selectedDate]
  )
  const openCreate = useCallback(() => {
    setError(null)
    setDialog({ kind: "create", requestId: crypto.randomUUID() })
  }, [])
  const toggleArchived = useCallback(
    () => setShowArchived((current) => !current),
    []
  )
  const openOccurrence = useCallback(
    (
      task: HouseholdTask,
      entry: HouseholdTaskOccurrence,
      kind: OccurrenceIntent
    ) => {
      setError(null)
      setDialog({ kind, task, entry, requestId: crypto.randomUUID() })
    },
    []
  )
  const openHistoryAction = useCallback(
    (
      entry: HouseholdTaskOccurrence,
      kind: "edit-execution" | "delete-execution"
    ) => {
      setReturnHistory(dialog?.task ?? null)
      setDialog({
        kind,
        task: dialog?.task,
        entry,
        requestId: crypto.randomUUID(),
      })
    },
    [dialog?.task]
  )
  const tasks = data.tasks.filter((task) => task.archived === showArchived)
  const occurrencesByTask = new Map<string, typeof data.occurrences>()
  for (const entry of data.occurrences) {
    const entries = occurrencesByTask.get(entry.taskId) ?? []
    entries.push(entry)
    occurrencesByTask.set(entry.taskId, entries)
  }
  return (
    <main className="mx-auto w-full max-w-[96rem] px-3 pt-2 text-ink sm:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tareas del hogar</h1>
          <p className="mt-1 text-sm text-muted">
            Planifica las tareas recurrentes y consulta cuándo se han hecho.
          </p>
        </div>
        <button
          type="button"
          className={primaryClass}
          disabled={pending}
          onClick={openCreate}
        >
          Nueva tarea
        </button>
      </header>
      {error && !dialog ? <ErrorBanner>{error}</ErrorBanner> : null}
      <div role="status" className="sr-only">
        {pending ? "Guardando cambios…" : ""}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
        <section aria-label="Catálogo de tareas" className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">
              {showArchived ? "Archivadas" : "Tareas activas"} ({tasks.length})
            </h2>
            <button
              type="button"
              className={controlClass}
              aria-pressed={showArchived}
              onClick={toggleArchived}
            >
              {showArchived ? "Ver activas" : "Ver archivadas"}
            </button>
          </div>
          {!tasks.length ? (
            <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
              {showArchived
                ? "No hay tareas archivadas."
                : "Crea tu primera tarea para empezar a planificar."}
            </p>
          ) : null}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              occurrences={occurrencesByTask.get(task.id) ?? []}
              today={today}
              disabled={pending}
              onIntent={openTask}
              onDrop={drop}
              onHover={setHoverDate}
            />
          ))}
        </section>
        <div className="min-w-0">
          <TaskMonthCalendar
            selectedDate={selectedDate}
            today={today}
            occurrences={data.occurrences}
            hoverDate={hoverDate}
            onSelect={setSelectedDate}
            onMonth={changeMonth}
          />
          <TaskDayList
            date={selectedDate}
            tasks={data.tasks}
            occurrences={data.occurrences}
            disabled={pending}
            onIntent={openOccurrence}
            onDrop={drop}
            onHover={setHoverDate}
          />
        </div>
      </div>
      {dialog ? (
        <TaskDialog
          key={`${dialog.kind}-${dialog.requestId}`}
          state={dialog}
          occurrences={
            dialog.task ? (occurrencesByTask.get(dialog.task.id) ?? []) : []
          }
          today={today}
          selectedDate={selectedDate}
          pending={pending}
          error={error}
          onDismiss={dismiss}
          onSubmit={run}
          onHistoryAction={openHistoryAction}
        />
      ) : null}
    </main>
  )
}
