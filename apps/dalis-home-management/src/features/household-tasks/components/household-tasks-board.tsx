"use client"

import { useRouter } from "next/navigation"
import {
  type ChangeEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react"
import { ErrorBanner } from "@/components/ui/error-banner"
import { SearchInput } from "@/components/ui/search-input"
import { householdTaskAction } from "@/features/household-tasks/actions"
import { getMadridIsoDate } from "@/features/meal-planning/week-utils"
import type { HouseholdTaskCommand } from "@/schemas/household-task"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
  HouseholdTasksData,
} from "@/types/household-task"
import { taskStatus } from "../task-status"
import { TaskActionIcon } from "./task-action-icon"
import { TaskCard, type TaskIntent } from "./task-card"
import { type OccurrenceIntent, TaskDayList } from "./task-day-list"
import { TaskDialog, type TaskDialogState } from "./task-dialog"
import { TaskDragHandle, type TaskDragPayload } from "./task-drag-handle"
import { TaskMonthCalendar } from "./task-month-calendar"
import { controlClass, fieldClass, primaryClass } from "./task-ui"

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
  const [search, setSearch] = useState("")
  const changeSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
    []
  )
  const clearSearch = useCallback(() => setSearch(""), [])
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
  const openTask = useCallback(
    (task: HouseholdTask, kind: TaskIntent) => {
      setError(null)
      if (kind === "restore") {
        setShowArchived(false)
        run({ kind: "restore", taskId: task.id })
        return
      }
      setDialog({ kind, task, requestId: crypto.randomUUID() })
    },
    [run]
  )
  const toggleOccurrence = useCallback(
    (task: HouseholdTask, entry: HouseholdTaskOccurrence) => {
      if (!entry.completedDate) {
        setDialog({
          kind: "complete",
          task,
          entry,
          requestId: crypto.randomUUID(),
        })
        return
      }
      run(
        entry.completedDate
          ? {
              kind: "delete-execution",
              taskId: task.id,
              occurrenceId: entry.id,
              expectedCompletedDate: entry.completedDate,
            }
          : {
              kind: "complete",
              taskId: task.id,
              occurrenceId: entry.id,
              completedDate: today,
            },
        false
      )
    },
    [run, today]
  )
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
  const confirmGhost = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const task = data.tasks.find(
        (candidate) => candidate.id === event.currentTarget.dataset.task
      )
      const date = event.currentTarget.dataset.date
      if (task && date) drop({ task }, date)
    },
    [data.tasks, drop]
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
  const tasks = data.tasks.filter(
    (task) =>
      task.archived === showArchived &&
      task.name.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es"))
  )
  const ghosts = data.tasks.flatMap((task) => {
    if (task.archived) return []
    const entries = data.occurrences.filter((entry) => entry.taskId === task.id)
    const status = taskStatus(task.intervalDays, entries, today)
    const dueDate = status.dueDate
    if (
      !dueDate ||
      entries.some(
        (entry) =>
          !entry.completedDate && entry.date <= dueDate && entry.date >= today
      )
    )
      return []
    return [{ task, date: dueDate }]
  })
  const occurrencesByTask = new Map<string, typeof data.occurrences>()
  for (const entry of data.occurrences) {
    const entries = occurrencesByTask.get(entry.taskId) ?? []
    entries.push(entry)
    occurrencesByTask.set(entry.taskId, entries)
  }
  return (
    <main className="mx-auto min-h-screen w-full max-w-[96rem] overflow-x-clip px-4 pt-5 text-ink sm:px-8 sm:pt-8">
      <header className="mb-2 flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <div className="contents sm:block">
          <h1 className="sr-only font-semibold tracking-[-0.05em] sm:not-sr-only sm:text-5xl">
            Tareas del hogar
          </h1>
          <p className="mt-3 hidden text-base leading-6 text-muted sm:block">
            Planifica las tareas recurrentes y consulta cuándo se han hecho.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={primaryClass}
            disabled={pending}
            onClick={openCreate}
            aria-label="Nueva tarea"
            title="Nueva tarea"
          >
            <TaskActionIcon name="add" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
          <button
            type="button"
            className={`${controlClass} min-w-8 px-2`}
            aria-label={showArchived ? "Ver activas" : "Ver archivadas"}
            title={showArchived ? "Ver activas" : "Ver archivadas"}
            aria-pressed={showArchived}
            onClick={toggleArchived}
          >
            <TaskActionIcon name={showArchived ? "active" : "archive"} />
            <span className="hidden sm:inline">
              {showArchived ? "Ver activas" : "Ver archivadas"}
            </span>
          </button>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-border bg-field px-2.5 py-1 text-xs font-semibold text-muted">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-primary"
            />
            {tasks.length}{" "}
            {showArchived
              ? "archivadas"
              : tasks.length === 1
                ? "tarea"
                : "tareas"}
          </span>
        </div>
      </header>
      {error && !dialog ? <ErrorBanner>{error}</ErrorBanner> : null}
      <div role="status" className="sr-only">
        {pending ? "Guardando cambios…" : ""}
      </div>
      <div className="grid items-start gap-2 lg:gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)]">
        <section
          aria-label="Catálogo de tareas"
          className="min-w-0 space-y-1.5"
        >
          <SearchInput
            aria-label="Buscar tareas"
            placeholder="Buscar tareas"
            value={search}
            onChange={changeSearch}
            onClear={clearSearch}
            className={fieldClass}
          />
          <h2 className="sr-only">
            {showArchived ? "Tareas archivadas" : "Tareas activas"}
          </h2>
          {!tasks.length ? (
            <p className="rounded-[1.5rem] border border-dashed border-border px-3 py-2 text-xs text-muted">
              {showArchived
                ? "No hay tareas archivadas."
                : "Crea tu primera tarea para empezar a planificar."}
            </p>
          ) : null}
          <section
            aria-label="Tareas: desplaza horizontalmente para cambiar de ficha"
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto"
          >
            {tasks.map((task) => (
              <div key={task.id} className="w-full shrink-0 snap-start">
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
              </div>
            ))}
          </section>
        </section>
        <div className="min-w-0">
          <TaskMonthCalendar
            selectedDate={selectedDate}
            today={today}
            occurrences={data.occurrences}
            hoverDate={hoverDate}
            onSelect={setSelectedDate}
            onMonth={changeMonth}
            ghosts={ghosts}
          />
          {ghosts
            .filter((ghost) => ghost.date === selectedDate)
            .map(({ task, date }) => (
              <div
                key={task.id}
                className="mt-2 flex items-center gap-2 rounded-xl border border-warning bg-warning-soft p-2 text-warning"
              >
                <span className="flex-1">⚠ {task.name}</span>
                <button
                  type="button"
                  className={controlClass}
                  disabled={pending}
                  data-task={task.id}
                  data-date={date}
                  onClick={confirmGhost}
                >
                  Programar
                </button>
                <TaskDragHandle
                  payload={{ task }}
                  disabled={pending}
                  onDrop={drop}
                  onHover={setHoverDate}
                />
              </div>
            ))}
          <TaskDayList
            date={selectedDate}
            tasks={data.tasks}
            occurrences={data.occurrences}
            disabled={pending}
            onIntent={openOccurrence}
            onToggleComplete={toggleOccurrence}
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
