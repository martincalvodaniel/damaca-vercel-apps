// biome-ignore-all lint/performance/noJsxPropsBind: Native form handlers do not participate in memoized component boundaries.
import type { FormEvent } from "react"
import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"
import type { FiscalMutation } from "../hooks/useFiscalAgenda"

import { buttonClass, controlClass } from "./styles"

interface Props {
  task?: FiscalTask
  today: string
  pending: boolean
  onCancel: () => void
  onSave: (action: FiscalMutation, dueYear?: number) => void
}

export function FiscalTaskForm({
  task,
  today,
  pending,
  onCancel,
  onSave,
}: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const value = (name: string) => String(fields.get(name) ?? "").trim()
    const optional = (name: string) => value(name) || undefined
    const progress = {
      filedOn: optional("filedOn"),
      paidOn: optional("paidOn"),
      notes: optional("notes"),
      receipt: optional("receipt"),
    }
    if (task?.source) {
      onSave({
        method: "PUT",
        body: {
          action: "progress",
          id: task.id,
          progress: {
            ...progress,
            paymentDueOverride: optional("paymentDueOverride"),
          },
        },
      })
      return
    }
    const details = {
      ...progress,
      title: value("title"),
      model: value("model"),
      exercise: optional("exercise") ? Number(value("exercise")) : undefined,
      period: value("period"),
      filingDue: optional("filingDue"),
      debitDue: optional("debitDue"),
      paymentDue: optional("paymentDue"),
    }
    if (!details.filingDue && !details.paymentDue) {
      const input = event.currentTarget.elements.namedItem("filingDue")
      if (input instanceof HTMLInputElement) {
        input.setCustomValidity(
          "Indica un vencimiento de presentación o de pago."
        )
        input.reportValidity()
      }
      return
    }
    const year = Number((details.filingDue ?? details.paymentDue)?.slice(0, 4))
    onSave(
      task
        ? {
            method: "PUT",
            body: { action: "manual", id: task.id, task: details },
          }
        : { method: "POST", body: { action: "manual", task: details } },
      year
    )
  }

  return (
    <form className="space-y-3 rounded-lg border p-4" onSubmit={submit}>
      <h2 className="font-semibold">
        {task ? `Editar ${task.title}` : "Añadir trámite manual"}
      </h2>
      <fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2">
        {!task?.source && (
          <>
            <label>
              Título
              <input
                className={controlClass}
                name="title"
                required
                maxLength={120}
                defaultValue={task?.title}
              />
            </label>
            <label>
              Modelo
              <input
                className={controlClass}
                name="model"
                maxLength={20}
                defaultValue={task?.model}
              />
            </label>
            <label>
              Ejercicio
              <input
                className={controlClass}
                name="exercise"
                type="number"
                min={2000}
                max={2100}
                defaultValue={task?.exercise}
              />
            </label>
            <label>
              Período
              <input
                className={controlClass}
                name="period"
                maxLength={40}
                defaultValue={task?.period}
              />
            </label>
            <label>
              Vencimiento de presentación
              <input
                className={controlClass}
                name="filingDue"
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                defaultValue={task?.filingDue}
                onChange={(event) => event.currentTarget.setCustomValidity("")}
              />
            </label>
            <label>
              Límite de domiciliación
              <input
                className={controlClass}
                name="debitDue"
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                defaultValue={task?.debitDue}
              />
            </label>
            <label>
              Vencimiento de pago
              <input
                className={controlClass}
                name="paymentDue"
                type="date"
                min="2000-01-01"
                max="2100-12-31"
                defaultValue={task?.paymentDue}
                onChange={(event) => {
                  const filingInput =
                    event.currentTarget.form?.elements.namedItem("filingDue")
                  if (filingInput instanceof HTMLInputElement)
                    filingInput.setCustomValidity("")
                }}
              />
            </label>
          </>
        )}
        {task?.source !== undefined && task.paymentDue === undefined && (
          <label>
            Vencimiento de pago, si corresponde
            <input
              className={controlClass}
              name="paymentDueOverride"
              type="date"
              min="2000-01-01"
              max="2100-12-31"
              defaultValue={task.paymentDueOverride}
            />
          </label>
        )}
        <label>
          Presentado el
          <input
            className={controlClass}
            name="filedOn"
            type="date"
            max={today}
            defaultValue={task?.filedOn}
          />
        </label>
        <label>
          Pagado el
          <input
            className={controlClass}
            name="paidOn"
            type="date"
            max={today}
            defaultValue={task?.paidOn}
          />
        </label>
        <label>
          Referencia o enlace privado del justificante
          <input
            className={controlClass}
            name="receipt"
            maxLength={500}
            defaultValue={task?.receipt}
          />
        </label>
        <label>
          Notas
          <textarea
            className={controlClass}
            name="notes"
            maxLength={2000}
            defaultValue={task?.notes}
          />
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} type="submit" disabled={pending}>
          Guardar
        </button>
        <button
          className={buttonClass}
          type="button"
          onClick={onCancel}
          disabled={pending}
        >
          Cerrar
        </button>
      </div>
    </form>
  )
}
