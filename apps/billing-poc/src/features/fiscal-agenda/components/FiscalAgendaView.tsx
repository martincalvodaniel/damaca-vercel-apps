// biome-ignore-all lint/performance/noJsxPropsBind: Agenda row handlers capture the current task and render native controls.
"use client"

import Link from "next/link"
import { useState } from "react"
import AddButton from "@/components/ui/AddButton"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { FetchError } from "@/lib/client/swr-fetcher"
import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"
import {
  fiscalDatesChanged,
  fiscalDue,
  fiscalPaymentDue,
  fiscalStatus,
  madridDate,
} from "@/lib/domain/services/fiscal-calendar"
import { formatDate } from "@/lib/utils/formatters"
import {
  type FiscalMutation,
  useFiscalAgenda,
  useFiscalAgendaMutation,
} from "../hooks/useFiscalAgenda"
import { FiscalTaskForm } from "./FiscalTaskForm"
import {
  buttonClass,
  cardClass,
  controlClass,
  labelClass,
  linkClass,
  mutedClass,
  primaryButtonClass,
} from "./styles"

function deadlines(task: FiscalTask) {
  const paymentDue = fiscalPaymentDue(task)
  return [
    task.filingDue && `Presentación ${formatDate(task.filingDue)}`,
    task.debitDue && `Domiciliación ${formatDate(task.debitDue)}`,
    paymentDue && `Pago ${formatDate(paymentDue)}`,
  ]
    .filter(Boolean)
    .join(" · ")
}

function receiptLink(receipt: string) {
  const url = URL.parse(receipt)
  return url?.protocol === "https:" ? url.href : undefined
}

function taskPeriod(task: FiscalTask) {
  return [task.exercise, task.period].filter(Boolean).join(" · ")
}

export function FiscalAgendaView({
  owner,
  initialYear,
}: {
  owner: string
  initialYear: number
}) {
  const [year, setYear] = useState(initialYear)
  const [status, setStatus] = useState("")
  const [model, setModel] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [editing, setEditing] = useState<FiscalTask | "new" | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [problem, setProblem] = useState("")
  const { data, error, isLoading } = useFiscalAgenda(owner, year)
  const { trigger, isMutating } = useFiscalAgendaMutation(owner, year)
  const today = madridDate()
  const tasks = [...(data?.tasks ?? [])].sort(
    (a, b) =>
      (a.filingDue ?? a.paymentDue ?? "").localeCompare(
        b.filingDue ?? b.paymentDue ?? ""
      ) || a.title.localeCompare(b.title)
  )
  const official = new Map(data?.suggestions.map((task) => [task.id, task]))
  const savedIds = new Set(tasks.map((task) => task.id))
  const suggestions =
    data?.suggestions.filter((task) => !savedIds.has(task.id)) ?? []
  const models = [
    ...new Set(tasks.map((task) => task.model).filter(Boolean)),
  ].sort()
  const shown = tasks.filter(
    (task) =>
      (!model || task.model === model) &&
      (!status || fiscalStatus(task, today) === status)
  )
  const next = tasks
    .filter((task) => fiscalStatus(task, today) === "Pendiente")
    .sort((a, b) => fiscalDue(a).localeCompare(fiscalDue(b)))[0]

  async function save(action: FiscalMutation, nextYear?: number) {
    setProblem("")
    setMessage("")
    try {
      await trigger(action)
      setMessage("Agenda actualizada.")
      setEditing(null)
      setDeleting(null)
      setSelected([])
      if (nextYear !== undefined && nextYear !== year) {
        setYear(nextYear)
        setModel("")
        setStatus("")
      }
    } catch (cause) {
      const info = cause instanceof FetchError ? cause.info : null
      setProblem(
        typeof info === "object" &&
          info &&
          "error" in info &&
          typeof info.error === "string"
          ? info.error
          : "No se pudo guardar el cambio. Inténtalo de nuevo."
      )
    }
  }

  function incorporate(ids: string[]) {
    void save({ method: "POST", body: { action: "incorporate", year, ids } })
  }

  return (
    <div className="space-y-6">
      <Link className={linkClass} href="/fiscal-agenda/drafts">
        Ver borradores 303, 130 y 390
      </Link>
      <div className={`${cardClass} flex flex-wrap items-end gap-3 p-4`}>
        <label className={labelClass}>
          Año de vencimiento
          <select
            className={controlClass}
            value={year}
            disabled={isMutating}
            onChange={(event) => {
              setYear(Number(event.target.value))
              setEditing(null)
              setDeleting(null)
              setSelected([])
              setModel("")
              setStatus("")
              setProblem("")
              setMessage("")
            }}
          >
            {Array.from({ length: 101 }, (_, index) => index + 2000).map(
              (option) => (
                <option key={option}>{option}</option>
              )
            )}
          </select>
        </label>
        <label className={labelClass}>
          Estado
          <select
            className={controlClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Todos</option>
            <option>Pendiente</option>
            <option>Vencido</option>
            <option>Completado</option>
          </select>
        </label>
        <label className={labelClass}>
          Modelo
          <select
            className={controlClass}
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            <option value="">Todos</option>
            {models.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <AddButton
          ariaLabel="Añadir trámite"
          title="Añadir trámite"
          disabled={isMutating}
          onClick={() => setEditing("new")}
        />
      </div>
      {Boolean(problem) && <ErrorBanner>{problem}</ErrorBanner>}
      {Boolean(message) && <p role="status">{message}</p>}
      {Boolean(isLoading) && <p role="status">Cargando agenda…</p>}
      {Boolean(error) && (
        <ErrorBanner>No se pudo cargar la agenda fiscal.</ErrorBanner>
      )}
      {editing !== null && (
        <FiscalTaskForm
          key={editing === "new" ? "new" : editing.id}
          task={editing === "new" ? undefined : editing}
          today={today}
          pending={isMutating}
          problem={problem}
          onCancel={() => setEditing(null)}
          onSave={(action, nextYear) => void save(action, nextYear)}
        />
      )}
      {next !== undefined && (
        <p className={`${cardClass} ${mutedClass} p-4`}>
          <strong>Próximo vencimiento</strong> · {next.title} ·{" "}
          {formatDate(fiscalDue(next))}
        </p>
      )}
      {data !== undefined && (
        <section className="space-y-3" aria-label="Trámites incorporados">
          {shown.length === 0 && (
            <EmptyState variant="card">
              No hay trámites para estos filtros.
            </EmptyState>
          )}
          <ul className="space-y-3">
            {shown.map((task) => {
              const latest = official.get(task.id)
              const changed =
                latest &&
                !task.filedOn &&
                !task.paidOn &&
                fiscalDatesChanged(task, latest)
              return (
                <li
                  key={task.id}
                  className={`${cardClass} ${mutedClass} space-y-3 p-4`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {task.title}
                    </h2>
                    <Badge
                      tone={
                        fiscalStatus(task, today) === "Vencido"
                          ? "danger"
                          : fiscalStatus(task, today) === "Completado"
                            ? "success"
                            : "info"
                      }
                    >
                      {fiscalStatus(task, today)}
                    </Badge>
                  </div>
                  <p>{taskPeriod(task)}</p>
                  {task.exercise === 2026 &&
                    ["303", "130", "390"].includes(task.model) && (
                      <Link
                        className={linkClass}
                        href={`/fiscal-agenda/drafts?model=${task.model}&quarter=${task.model === "390" ? "4" : task.period[0]}`}
                      >
                        Ver borrador
                      </Link>
                    )}
                  <p>{deadlines(task)}</p>
                  {task.filedOn !== undefined && (
                    <p>Presentado el {formatDate(task.filedOn)}</p>
                  )}
                  {task.paidOn !== undefined && (
                    <p>Pagado el {formatDate(task.paidOn)}</p>
                  )}
                  {task.receipt !== undefined && (
                    <p className="break-all">
                      Justificante{" "}
                      {receiptLink(task.receipt) ? (
                        <a
                          className={linkClass}
                          href={receiptLink(task.receipt)}
                          rel="noreferrer"
                        >
                          Abrir enlace
                        </a>
                      ) : (
                        task.receipt
                      )}
                    </p>
                  )}
                  {task.notes !== undefined && (
                    <p className="whitespace-pre-wrap break-words">
                      {task.notes}
                    </p>
                  )}
                  {task.source !== undefined && (
                    <a className={linkClass} href={task.source}>
                      Fuente oficial AEAT
                    </a>
                  )}
                  {changed === true && latest !== undefined && (
                    <div>
                      <p>Nuevos plazos oficiales · {deadlines(latest)}</p>
                      <button
                        className={buttonClass}
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          void save({
                            method: "PUT",
                            body: { action: "refresh", id: task.id },
                          })
                        }
                      >
                        Aplicar nuevos plazos
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={buttonClass}
                      type="button"
                      disabled={isMutating}
                      onClick={() => setEditing(task)}
                    >
                      Editar {task.title}
                    </button>
                    {deleting === task.id ? (
                      <>
                        <button
                          className={buttonClass}
                          type="button"
                          disabled={isMutating}
                          onClick={() =>
                            void save({ method: "DELETE", id: task.id })
                          }
                        >
                          Confirmar eliminación
                        </button>
                        <button
                          className={buttonClass}
                          type="button"
                          disabled={isMutating}
                          onClick={() => setDeleting(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        className={buttonClass}
                        type="button"
                        disabled={isMutating}
                        onClick={() => setDeleting(task.id)}
                      >
                        Eliminar {task.title}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      {data !== undefined && !data.hasCatalog && (
        <p>
          Calendario oficial pendiente de incorporar. Puedes añadir trámites
          manuales.
        </p>
      )}
      {suggestions.length > 0 && (
        <details className={`${cardClass} space-y-3 p-4`}>
          <summary className="cursor-pointer rounded-sm font-semibold text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
            Sugerencias oficiales
          </summary>
          <p>
            Elige los modelos y períodos que quieres seguir según tu situación
            fiscal.
          </p>
          <button
            className={primaryButtonClass}
            type="button"
            disabled={isMutating || selected.length === 0}
            onClick={() => incorporate(selected)}
          >
            Incorporar selección
          </button>
          <ul className="space-y-2">
            {suggestions.map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={isMutating}
                    checked={selected.includes(task.id)}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      setSelected((ids) =>
                        checked
                          ? [...ids, task.id]
                          : ids.filter((id) => id !== task.id)
                      )
                    }}
                  />
                  {task.title} · {taskPeriod(task)} · {deadlines(task)}
                </label>
                <a className={linkClass} href={task.source}>
                  AEAT
                </a>
                <button
                  className={buttonClass}
                  type="button"
                  disabled={isMutating}
                  onClick={() => incorporate([task.id])}
                >
                  Incorporar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
