// biome-ignore-all lint/performance/noJsxPropsBind: Native controls capture the current form and have no memoized boundary.
"use client"

import { type FormEvent, useId, useState } from "react"
import { FetchError } from "@/lib/client/swr-fetcher"
import {
  FISCAL_MODELS,
  type FiscalDocument,
  type FiscalInput,
  type FiscalModel,
} from "@/lib/domain/entities/fiscal-draft"
import { madridDate } from "@/lib/domain/services/fiscal-calendar"
import {
  FISCAL_INPUT_LABELS,
  type FiscalInputName,
  fiscalInputKey,
  fiscalInputs,
} from "@/lib/domain/services/fiscal-draft"
import { formatCurrency } from "@/lib/utils/formatters"
import type { DraftUpdate } from "@/schemas/fiscal-draft-validator"
import {
  buttonClass,
  controlClass,
} from "../../fiscal-agenda/components/styles"
import { useFiscalDraft, useUpdateFiscalDraft } from "../hooks/useFiscalDraft"

function submitFields(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  return new FormData(event.currentTarget)
}

function DocumentReview({
  document,
  pending,
  save,
}: {
  document: FiscalDocument
  pending: boolean
  save: (update: DraftUpdate) => void
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    const fields = submitFields(event)
    const reference = String(fields.get("reference") ?? "")
    const base = String(fields.get("base") ?? "")
    const vat = String(fields.get("vat") ?? "")
    save({
      ...(reference && {
        reference,
        base: base === "" ? undefined : Number(base),
        vat: vat === "" ? undefined : Number(vat),
      }),
      action: "review",
      id: document.id,
      fingerprint: document.fingerprint,
      date: String(fields.get("date")),
      classification:
        fields.get("classification") === "excluded" ? "excluded" : "ordinary",
      vatDeductible: fields.has("vatDeductible"),
      incomeTaxDeductible: fields.has("incomeTaxDeductible"),
      reason: String(fields.get("reason")),
    })
  }
  return (
    <details
      id={`document-${document.id}`}
      className="space-y-2 rounded border p-3"
    >
      <summary className="cursor-pointer">
        {document.direction === "income" ? "Ingreso" : "Gasto"} ·{" "}
        {document.paymentDate} · {formatCurrency(document.base)} ·{" "}
        {document.review ? "Revisada" : "Pendiente"}
      </summary>
      <p>
        IVA {document.rate} % · {formatCurrency(document.vat)}
      </p>
      <ul className="break-all">
        {document.references.map((ref) => (
          <li key={ref}>{ref}</li>
        ))}
      </ul>
      {document.issue !== undefined && <p>{document.issue}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={pending} className="grid gap-2 sm:grid-cols-2">
          <label>
            Fecha fiscal
            <input
              className={controlClass}
              name="date"
              type="date"
              max={madridDate()}
              defaultValue={document.review?.date ?? document.paymentDate}
              required
            />
          </label>
          <label>
            Tratamiento
            <select
              className={controlClass}
              name="classification"
              defaultValue={
                document.review?.classification ??
                (document.issue ? "excluded" : "ordinary")
              }
            >
              <option
                value="ordinary"
                disabled={
                  Boolean(document.issue) && document.references.length === 1
                }
              >
                Operación interior corriente
              </option>
              <option value="excluded">
                Excluir del cálculo y revisar fuera de Billing
              </option>
            </select>
          </label>
          {document.references.length > 1 && (
            <>
              <label>
                Factura aplicable
                <select
                  name="reference"
                  className={controlClass}
                  defaultValue={document.review?.reference ?? ""}
                >
                  <option value="">Selecciona una factura</option>
                  {document.references.map((reference) => (
                    <option key={reference}>{reference}</option>
                  ))}
                </select>
              </label>
              <label>
                Base de la factura
                <input
                  name="base"
                  type="number"
                  step="0.01"
                  min={0}
                  className={controlClass}
                  defaultValue={document.review?.base}
                />
              </label>
              <label>
                Cuota de IVA de la factura
                <input
                  name="vat"
                  type="number"
                  step="0.01"
                  min={0}
                  className={controlClass}
                  defaultValue={document.review?.vat}
                />
              </label>
            </>
          )}
          {document.direction === "outcome" && (
            <>
              <label>
                <input
                  type="checkbox"
                  name="vatDeductible"
                  defaultChecked={document.review?.vatDeductible}
                />{" "}
                IVA deducible
              </label>
              <label>
                <input
                  type="checkbox"
                  name="incomeTaxDeductible"
                  defaultChecked={document.review?.incomeTaxDeductible}
                />{" "}
                Gasto deducible en IRPF
              </label>
            </>
          )}
          <label>
            Motivo o comprobación
            <input
              className={controlClass}
              name="reason"
              required
              maxLength={500}
              defaultValue={document.review?.reason}
            />
          </label>
          <button type="submit" className={buttonClass}>
            Guardar revisión
          </button>
        </fieldset>
      </form>
    </details>
  )
}

function InputReview({
  name,
  input,
  pending,
  save,
}: {
  name: FiscalInputName
  input?: FiscalInput
  pending: boolean
  save: (update: DraftUpdate) => void
}) {
  const amountId = useId()

  function submit(event: FormEvent<HTMLFormElement>) {
    const fields = submitFields(event)
    save({
      action: "input",
      name,
      amount: Number(fields.get("amount")),
      reason: String(fields.get("reason")),
    })
  }
  return (
    <form onSubmit={submit} className="rounded border p-3">
      <fieldset disabled={pending} className="grid gap-2 sm:grid-cols-2">
        <label htmlFor={amountId}>
          {FISCAL_INPUT_LABELS[name]}
          {name === "obligation" ? (
            <select
              id={amountId}
              name="amount"
              required
              className={controlClass}
              defaultValue={input?.amount ?? ""}
            >
              <option value="">Por confirmar</option>
              <option value="1">Obligado</option>
              <option value="0">Exonerado</option>
            </select>
          ) : (
            <input
              id={amountId}
              name="amount"
              required
              type="number"
              step="0.01"
              className={controlClass}
              defaultValue={input?.amount}
            />
          )}
        </label>
        <label>
          Motivo o referencia
          <input
            name="reason"
            required
            maxLength={500}
            className={controlClass}
            defaultValue={input?.reason}
          />
        </label>
        <button type="submit" className={buttonClass}>
          Guardar dato
        </button>
      </fieldset>
    </form>
  )
}

export function FiscalDraftView({
  owner,
  initialModel,
  initialQuarter,
}: {
  owner: string
  initialModel: FiscalModel
  initialQuarter: number
}) {
  const [model, setModel] = useState(initialModel)
  const [quarter, setQuarter] = useState(initialQuarter)
  const [problem, setProblem] = useState("")
  const { data, error, isLoading } = useFiscalDraft(owner, model, quarter)
  const { trigger, isMutating } = useUpdateFiscalDraft(owner, model, quarter)

  async function save(update: DraftUpdate) {
    setProblem("")
    try {
      await trigger(update)
    } catch (cause) {
      const info = cause instanceof FetchError ? cause.info : null
      setProblem(
        typeof info === "object" &&
          info &&
          "error" in info &&
          typeof info.error === "string"
          ? info.error
          : "No se pudo guardar la revisión."
      )
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Borradores fiscales · 2026</h1>
      <p>
        IVA trimestral en régimen general e IRPF en estimación directa. Revisa
        el borrador antes de trasladar los importes a la AEAT.
      </p>
      <div className="flex flex-wrap gap-3">
        <label>
          Modelo
          <select
            value={model}
            disabled={isMutating}
            className={controlClass}
            onChange={(event) => {
              const selected = FISCAL_MODELS.find(
                (item) => item === event.target.value
              )
              if (selected) setModel(selected)
            }}
          >
            {FISCAL_MODELS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        {model !== "390" && (
          <label>
            Trimestre
            <select
              value={quarter}
              disabled={isMutating}
              className={controlClass}
              onChange={(event) => setQuarter(Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((item) => (
                <option key={item} value={item}>
                  T{item}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {Boolean(problem) && <p role="alert">{problem}</p>}
      {Boolean(error) && <p role="alert">No se pudo cargar el borrador.</p>}
      {Boolean(isLoading) && <p role="status">Calculando…</p>}
      {data !== undefined && (
        <>
          <p>
            Pagos sin factura o solo con recibo excluidos del histórico
            consultado: {data.ignored}.
          </p>
          <h2 className="font-semibold">
            {data.pending.length
              ? "Borrador parcial"
              : "Borrador de operaciones interiores revisadas"}
          </h2>
          <ul>
            {data.pending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <section className="grid gap-2" aria-label="Casillas">
            {data.cells.map((cell) => (
              <details key={cell.label} className="rounded border p-3">
                <summary className="cursor-pointer">
                  {cell.code} · {cell.label} · {formatCurrency(cell.amount)}
                  {cell.pending ? " · subtotal conocido" : ""}
                </summary>
                <ul>
                  {cell.documentIds.map((id) => (
                    <li key={id}>
                      <a className="underline" href={`#document-${id}`}>
                        Pago {id}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
          <section className="space-y-2" aria-label="Datos adicionales">
            <h2 className="font-semibold">Datos adicionales</h2>
            {fiscalInputs(model).map((name) => {
              const key = fiscalInputKey(name, quarter)
              return (
                <InputReview
                  key={key}
                  name={name}
                  input={data.inputs[key]}
                  pending={isMutating}
                  save={save}
                />
              )
            })}
          </section>
          <section className="space-y-2" aria-label="Facturas">
            <h2 className="font-semibold">Facturas del período</h2>
            {data.documents.map((document) => (
              <DocumentReview
                key={`${document.id}:${document.fingerprint}`}
                document={document}
                pending={isMutating}
                save={save}
              />
            ))}
          </section>
        </>
      )}
    </div>
  )
}
