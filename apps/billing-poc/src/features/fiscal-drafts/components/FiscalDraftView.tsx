// biome-ignore-all lint/performance/noJsxPropsBind: Native controls capture the current form and have no memoized boundary.
"use client"

import dynamic from "next/dynamic"
import { type FormEvent, useId, useState } from "react"
import { Badge } from "@/components/ui/Badge"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { buildOpenInvoiceUrl } from "@/features/invoices/hooks/useInvoiceMutations"
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
  cardClass,
  controlClass,
  labelClass,
  linkClass,
  mutedClass,
  primaryButtonClass,
} from "../../fiscal-agenda/components/styles"
import { useFiscalDraft, useUpdateFiscalDraft } from "../hooks/useFiscalDraft"

const InvoicePaymentModal = dynamic(
  () => import("@/features/invoices/components/InvoicePaymentModal"),
  { ssr: false }
)

function invoiceLink(paymentId: string, reference: string) {
  if (reference.startsWith("id:")) {
    const id = reference.slice(3)
    return {
      label: id,
      href: id ? buildOpenInvoiceUrl(paymentId, id) : undefined,
    }
  }
  const label = reference.startsWith("url:") ? reference.slice(4) : reference
  const url = URL.parse(label)
  return {
    label,
    href:
      url && (url.protocol === "https:" || url.protocol === "http:")
        ? url.href
        : undefined,
  }
}

function submitFields(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  return new FormData(event.currentTarget)
}

function DocumentReview({
  document,
  pending,
  save,
  openPayment,
}: {
  document: FiscalDocument
  openPayment: (id: string) => void
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
      className={`${cardClass} space-y-3 p-4`}
    >
      <summary className="cursor-pointer rounded-sm text-sm font-semibold text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
        {document.direction === "income" ? "Ingreso" : "Gasto"} ·{" "}
        {document.paymentDate} · {formatCurrency(document.base)} ·{" "}
        {document.review ? "Revisada" : "Pendiente"}
      </summary>
      <div className={`${mutedClass} flex flex-wrap gap-x-4 gap-y-2`}>
        <button
          type="button"
          className={linkClass}
          onClick={() => openPayment(document.id)}
        >
          IVA {document.rate} % · {formatCurrency(document.vat)}
        </button>
        <button
          type="button"
          className={linkClass}
          onClick={() => openPayment(document.id)}
        >
          Total · {formatCurrency(document.paymentTotal)}
        </button>
      </div>
      <ul className="break-all">
        {document.references.map((reference) => {
          const { href, label } = invoiceLink(document.id, reference)
          return (
            <li key={reference}>
              {href ? (
                <a
                  className={linkClass}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </a>
              ) : (
                label
              )}
            </li>
          )
        })}
      </ul>
      {document.issue !== undefined && <p>{document.issue}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={pending} className="grid gap-2 sm:grid-cols-2">
          <label className={labelClass}>
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
          <label className={labelClass}>
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
              <label className={labelClass}>
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
              <label className={labelClass}>
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
              <label className={labelClass}>
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
              <label className={labelClass}>
                <input
                  type="checkbox"
                  name="vatDeductible"
                  defaultChecked={document.review?.vatDeductible}
                />{" "}
                IVA deducible
              </label>
              <label className={labelClass}>
                <input
                  type="checkbox"
                  name="incomeTaxDeductible"
                  defaultChecked={document.review?.incomeTaxDeductible}
                />{" "}
                Gasto deducible en IRPF
              </label>
            </>
          )}
          <label className={labelClass}>
            Motivo o comprobación
            <input
              className={controlClass}
              name="reason"
              required
              maxLength={500}
              defaultValue={document.review?.reason}
            />
          </label>
          <button type="submit" className={primaryButtonClass}>
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
    <form onSubmit={submit} className={`${cardClass} p-4`}>
      <fieldset disabled={pending} className="grid gap-2 sm:grid-cols-2">
        <label className={labelClass} htmlFor={amountId}>
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
        <label className={labelClass}>
          Motivo o referencia
          <input
            name="reason"
            required
            maxLength={500}
            className={controlClass}
            defaultValue={input?.reason}
          />
        </label>
        <button type="submit" className={primaryButtonClass}>
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
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const { data, error, isLoading, mutate } = useFiscalDraft(
    owner,
    model,
    quarter
  )
  const { trigger, isMutating } = useUpdateFiscalDraft(owner, model, quarter)

  function closePayment() {
    setPaymentId(null)
    void mutate()
  }

  function refreshDraft() {
    void mutate()
  }

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
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Borradores fiscales · 2026
      </h1>
      <p className={mutedClass}>
        IVA trimestral en régimen general e IRPF en estimación directa. Revisa
        el borrador antes de trasladar los importes a la AEAT.
      </p>
      <div className={`${cardClass} flex flex-wrap items-end gap-3 p-4`}>
        <label className={labelClass}>
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
          <label className={labelClass}>
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
      {Boolean(problem) && <ErrorBanner>{problem}</ErrorBanner>}
      {Boolean(error) && (
        <ErrorBanner>No se pudo cargar el borrador.</ErrorBanner>
      )}
      {Boolean(isLoading) && <p role="status">Calculando…</p>}
      {data !== undefined && (
        <>
          <p>
            Pagos sin factura o solo con recibo excluidos del histórico
            consultado: {data.ignored}.
          </p>
          <h2>
            <Badge tone={data.pending.length ? "warning" : "success"}>
              {data.pending.length
                ? "Borrador parcial"
                : "Borrador de operaciones interiores revisadas"}
            </Badge>
          </h2>
          <ul>
            {data.pending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <section className="grid gap-2" aria-label="Casillas">
            {data.cells.map((cell) => (
              <details key={cell.label} className={`${cardClass} p-4`}>
                <summary className="cursor-pointer rounded-sm text-sm font-semibold text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
                  {cell.code} · {cell.label} · {formatCurrency(cell.amount)}
                  {cell.pending ? " · subtotal conocido" : ""}
                </summary>
                <ul>
                  {cell.documentIds.map((id) => (
                    <li key={id}>
                      <a className={linkClass} href={`#document-${id}`}>
                        Pago {id}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </section>
          <section className="space-y-2" aria-label="Datos adicionales">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Datos adicionales
            </h2>
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
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Facturas del período
            </h2>
            {data.documents.map((document) => (
              <DocumentReview
                key={`${document.id}:${document.fingerprint}`}
                document={document}
                pending={isMutating}
                save={save}
                openPayment={setPaymentId}
              />
            ))}
          </section>
        </>
      )}
      {paymentId !== null && (
        <InvoicePaymentModal
          key={paymentId}
          paymentId={paymentId}
          onClose={closePayment}
          onUpdate={refreshDraft}
          onDelete={closePayment}
        />
      )}
    </div>
  )
}
