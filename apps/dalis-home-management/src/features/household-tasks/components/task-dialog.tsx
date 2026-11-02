"use client"

import { type FormEvent, type MouseEvent, useCallback, useId } from "react"
import { DialogHeader } from "@/components/ui/dialog-header"
import { ErrorBanner } from "@/components/ui/error-banner"
import { ModalDialog } from "@/components/ui/modal-dialog"
import type { HouseholdTaskCommand } from "@/schemas/household-task"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"
import type { TaskIntent } from "./task-card"
import type { OccurrenceIntent } from "./task-day-list"
import { controlClass, fieldClass, formatTaskDate } from "./task-ui"

export interface TaskDialogState {
  kind: "create" | TaskIntent | OccurrenceIntent
  requestId: string
  task?: HouseholdTask
  entry?: HouseholdTaskOccurrence
}
const titles: Record<TaskDialogState["kind"], string> = {
  create: "Nueva tarea",
  update: "Editar tarea",
  archive: "Archivar tarea",
  schedule: "Programar tarea",
  record: "Registrar ejecución",
  history: "Histórico de ejecuciones",
  complete: "Completar tarea",
  move: "Reprogramar tarea",
  cancel: "Cancelar programación",
  "edit-execution": "Corregir ejecución",
  "delete-execution": "Eliminar ejecución",
}

export function TaskDialog({
  state,
  occurrences,
  today,
  selectedDate,
  pending,
  error,
  onDismiss,
  onSubmit,
  onHistoryAction,
}: {
  state: TaskDialogState
  occurrences: HouseholdTaskOccurrence[]
  today: string
  selectedDate: string
  pending: boolean
  error: string | null
  onDismiss: () => void
  onSubmit: (command: HouseholdTaskCommand) => void
  onHistoryAction: (
    entry: HouseholdTaskOccurrence,
    kind: "edit-execution" | "delete-execution"
  ) => void
}) {
  const formId = useId()
  const fieldId = useId()
  const isTaskForm = state.kind === "create" || state.kind === "update"
  const isExecution =
    state.kind === "record" ||
    state.kind === "complete" ||
    state.kind === "edit-execution"
  const isDateForm =
    isExecution || state.kind === "schedule" || state.kind === "move"
  const history = occurrences
    .filter((entry) => entry.completedDate)
    .sort((a, b) =>
      (b.completedDate ?? "").localeCompare(a.completedDate ?? "")
    )
  const confirmLabel =
    state.kind === "archive"
      ? "Confirmar archivo"
      : state.kind === "cancel"
        ? "Confirmar cancelación"
        : state.kind === "delete-execution"
          ? "Confirmar eliminación"
          : state.kind === "edit-execution"
            ? "Confirmar corrección"
            : "Guardar"

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (pending) return
      const data = new FormData(event.currentTarget)
      const taskId = state.task?.id ?? state.requestId
      const occurrenceId = state.entry?.id ?? state.requestId
      const date = String(data.get("date") ?? "")
      const fields = {
        name: String(data.get("name") ?? ""),
        intervalDays: Number(data.get("intervalDays")),
      }
      const initialDate = String(data.get("initialDate") ?? "")
      switch (state.kind) {
        case "create":
          onSubmit({
            kind: "create",
            taskId,
            ...fields,
            ...(initialDate ? { initialDate } : {}),
          })
          break
        case "update":
          onSubmit({ kind: "update", taskId, ...fields })
          break
        case "archive":
          onSubmit({ kind: "archive", taskId })
          break
        case "schedule":
          onSubmit({ kind: "schedule", taskId, occurrenceId, date })
          break
        case "record":
          onSubmit({
            kind: "record",
            taskId,
            occurrenceId,
            completedDate: date,
          })
          break
        case "complete":
          onSubmit({
            kind: "complete",
            taskId,
            occurrenceId,
            completedDate: date,
          })
          break
        case "move":
          if (state.entry)
            onSubmit({
              kind: "move",
              taskId,
              occurrenceId,
              expectedDate: state.entry.date,
              date,
            })
          break
        case "cancel":
          onSubmit({ kind: "cancel", taskId, occurrenceId })
          break
        case "edit-execution":
          if (state.entry?.completedDate)
            onSubmit({
              kind: "edit-execution",
              taskId,
              occurrenceId,
              expectedCompletedDate: state.entry.completedDate,
              completedDate: date,
            })
          break
        case "delete-execution":
          if (state.entry?.completedDate)
            onSubmit({
              kind: "delete-execution",
              taskId,
              occurrenceId,
              expectedCompletedDate: state.entry.completedDate,
            })
          break
      }
    },
    [pending, state, onSubmit]
  )
  const handleHistoryAction = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const entry = occurrences.find(
        (candidate) => candidate.id === event.currentTarget.dataset.entry
      )
      if (entry)
        onHistoryAction(
          entry,
          event.currentTarget.dataset.intent as
            | "edit-execution"
            | "delete-execution"
        )
    },
    [occurrences, onHistoryAction]
  )

  return (
    <ModalDialog open ariaLabel={titles[state.kind]} onDismiss={onDismiss}>
      <section className="flex h-full min-h-0 flex-col">
        <DialogHeader
          title={titles[state.kind]}
          onDismiss={onDismiss}
          cancelDisabled={pending}
          confirmLabel={state.kind === "history" ? undefined : confirmLabel}
          confirmForm={formId}
          confirmDisabled={pending}
          pending={pending}
        />
        <div className="dialog-content space-y-4 p-4 sm:p-6">
          {state.task ? (
            <p className="wrap-anywhere font-semibold">{state.task.name}</p>
          ) : null}
          {error ? <ErrorBanner>{error}</ErrorBanner> : null}
          {state.kind === "history" ? (
            <>
              {!history.length ? (
                <p className="text-sm text-muted">
                  Sin ejecuciones registradas.
                </p>
              ) : null}
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-border bg-surface p-3"
                  >
                    <p className="font-semibold text-success">
                      ✓ {formatTaskDate(entry.completedDate ?? entry.date)}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {entry.wasScheduled
                        ? `Fecha prevista: ${formatTaskDate(entry.date)}`
                        : "Ejecución sin programación previa"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={controlClass}
                        data-entry={entry.id}
                        data-intent="edit-execution"
                        onClick={handleHistoryAction}
                      >
                        Corregir fecha
                      </button>
                      <button
                        type="button"
                        className={`${controlClass} text-danger`}
                        data-entry={entry.id}
                        data-intent="delete-execution"
                        onClick={handleHistoryAction}
                      >
                        Eliminar ejecución
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <form
              id={formId}
              onSubmit={handleSubmit}
              className="mx-auto w-full max-w-xl space-y-5"
            >
              <fieldset disabled={pending} className="space-y-5">
                {isTaskForm ? (
                  <>
                    <div>
                      <label
                        htmlFor={`${fieldId}-name`}
                        className="mb-1 block text-sm font-semibold"
                      >
                        Nombre
                      </label>
                      <input
                        id={`${fieldId}-name`}
                        name="name"
                        required
                        maxLength={120}
                        defaultValue={state.task?.name ?? ""}
                        className={fieldClass}
                        autoComplete="off"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${fieldId}-interval`}
                        className="mb-1 block text-sm font-semibold"
                      >
                        Periodicidad máxima (días)
                      </label>
                      <input
                        id={`${fieldId}-interval`}
                        name="intervalDays"
                        type="number"
                        required
                        min={1}
                        max={36500}
                        step={1}
                        defaultValue={state.task?.intervalDays ?? 7}
                        className={fieldClass}
                      />
                      <p className="mt-1 text-sm text-muted">
                        Tiempo máximo recomendado entre ejecuciones. Aviso al
                        llegar al 80% sin una programación a tiempo.
                      </p>
                    </div>
                    {state.kind === "create" ? (
                      <div>
                        <label
                          htmlFor={`${fieldId}-initial`}
                          className="mb-1 block text-sm font-semibold"
                        >
                          Última ejecución previa (opcional)
                        </label>
                        <input
                          id={`${fieldId}-initial`}
                          name="initialDate"
                          type="date"
                          min="1900-01-01"
                          max={today}
                          className={fieldClass}
                        />
                        <p className="mt-1 text-sm text-muted">
                          Sin ejecuciones no se calculan avisos.
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : null}
                {isDateForm ? (
                  <div>
                    <label
                      htmlFor={`${fieldId}-date`}
                      className="mb-1 block text-sm font-semibold"
                    >
                      {isExecution
                        ? "Fecha real de ejecución"
                        : "Fecha prevista"}
                    </label>
                    <input
                      id={`${fieldId}-date`}
                      name="date"
                      type="date"
                      required
                      min="1900-01-01"
                      max={isExecution ? today : "2199-12-31"}
                      defaultValue={
                        isExecution
                          ? (state.entry?.completedDate ?? today)
                          : (state.entry?.date ?? selectedDate)
                      }
                      className={fieldClass}
                    />
                    {state.kind === "edit-execution" ? (
                      <p className="mt-2 text-sm text-warning">
                        Al guardar se corregirá el histórico y se recalculará la
                        periodicidad.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {state.kind === "archive" ? (
                  <p className="text-sm text-danger">
                    Se archivará esta tarea y se retirarán sus{" "}
                    {occurrences.filter((entry) => !entry.completedDate).length}{" "}
                    programaciones pendientes. El histórico se conservará.
                  </p>
                ) : null}
                {state.kind === "cancel" ? (
                  <p className="text-sm text-danger">
                    Se retirará la programación del{" "}
                    {formatTaskDate(state.entry?.date ?? selectedDate)}. La
                    tarea seguirá en el catálogo.
                  </p>
                ) : null}
                {state.kind === "delete-execution" ? (
                  <p className="text-sm text-danger">
                    Se eliminará esta ejecución y se recalculará la
                    periodicidad.{" "}
                    {state.entry?.wasScheduled && !state.task?.archived
                      ? "La programación volverá a estar pendiente."
                      : "Se retirará también su registro del calendario."}
                  </p>
                ) : null}
              </fieldset>
            </form>
          )}
        </div>
      </section>
    </ModalDialog>
  )
}
