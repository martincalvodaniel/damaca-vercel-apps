"use client"
import { useId, useRef, useState } from "react"
import ClientSelectorField from "@/components/shared/ClientSelectorField"
import PaymentActions from "@/components/shared/PaymentActions"
import ProductSelector from "@/components/shared/ProductSelector"
import { ConfirmAction } from "@/components/ui/ConfirmAction"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import FormField from "@/components/ui/FormField"
import { Modal } from "@/components/ui/Modal"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import {
  useCreateCommission,
  useGenerateCommissionPayment,
  useUpdateCommission,
} from "@/features/commissions/hooks/useCommissionMutations"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import FiringTemplateSelector from "@/features/firings/components/FiringTemplateSelector"
import PaymentConceptsList from "@/features/payments/components/month/PaymentConceptsList"
import type {
  Commission,
  CommissionFields,
} from "@/lib/domain/entities/commission"
import type {
  PaymentConcept,
  PaymentMethod,
} from "@/lib/domain/entities/payment"
import type { Product } from "@/lib/domain/entities/product"
import { computePaymentFinancials } from "@/lib/domain/services/payment-calculator"
import { formatCurrency } from "@/lib/utils/formatters"
import { createCommissionSchema } from "@/schemas/commission-validator"
import { useCommissionScope } from "./CommissionScope"
import { buildCommissionPatch, buildProductConcept } from "./commission-form"

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"

export default function CommissionFormModal({
  commission,
  onClose,
  onSaved,
  onOpenPayment,
}: {
  commission?: Commission
  onClose: () => void
  onOpenPayment: (id: string) => void
  onSaved: (message: string) => void
}) {
  const { isFiring, singular } = useCommissionScope()
  const generate = useGenerateCommissionPayment()
  const [submitting, setSubmitting] = useState(false)
  const id = useId()
  const original = useRef(commission)
  const persistedId = useRef(commission?._id)
  const [fields, setFields] = useState<CommissionFields>(() => ({
    title: commission?.title ?? "",
    description: commission?.description ?? "",
    clientId: commission?.clientId ?? "",
    dueDate: commission?.dueDate ?? "",
    prepaidAmount: commission?.prepaidAmount ?? 0,
    concepts: commission?.concepts.map((concept) => ({ ...concept })) ?? [],
    vat: commission?.vat ?? 21,
  }))
  const [error, setError] = useState<string | null>(null)
  const create = useCreateCommission()
  const update = useUpdateCommission()
  const pending =
    submitting || create.isMutating || update.isMutating || generate.isMutating
  const set = <K extends keyof CommissionFields>(
    key: K,
    value: CommissionFields[K]
  ) => setFields((previous) => ({ ...previous, [key]: value }))
  const persist = async () => {
    setError(null)
    const parsed = createCommissionSchema.safeParse(fields)
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          `${isFiring ? "Cocción" : "Encargo"} no válido`
      )
      return
    }
    try {
      const patch = original.current
        ? buildCommissionPatch(original.current, parsed.data)
        : parsed.data
      const result = persistedId.current
        ? Object.keys(patch).length
          ? await update.trigger({ ...patch, id: persistedId.current })
          : { id: persistedId.current, paymentSync: "unchanged" as const }
        : await create.trigger(parsed.data)
      persistedId.current = persistedId.current ?? result.id
      original.current = {
        ...commission,
        ...parsed.data,
        _id: persistedId.current,
        createdAt: commission?.createdAt ?? new Date(),
        updatedAt: new Date(),
      }
      return {
        id: persistedId.current,
        message:
          result.paymentSync === "invoiced"
            ? `${isFiring ? "Cocción guardada" : "Encargo guardado"}. Se conservó la factura del pago y no se sincronizó.`
            : isFiring
              ? "Cocción guardada"
              : "Encargo guardado",
      }
    } catch (error) {
      setError(
        extractErrorMessage(
          error,
          `No se pudo guardar ${isFiring ? "la cocción" : "el encargo"}`
        )
      )
    }
  }
  const save = async (method?: PaymentMethod) => {
    if (pending) return
    setSubmitting(true)
    try {
      const saved = await persist()
      if (!saved?.id) return
      if (method) {
        const result = await generate.trigger({
          id: saved.id,
          paymentMethod: method,
        })
        onSaved(saved.message)
        if (result.paymentId) onOpenPayment(result.paymentId)
      } else onSaved(saved.message)
    } catch (error) {
      setError(
        extractErrorMessage(
          error,
          "No se pudo generar el pago. Reintenta para completar la generación."
        )
      )
    } finally {
      setSubmitting(false)
    }
  }
  const changeConcept = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    if (index === undefined) return
    const { name, value } = event.target
    const key =
      name === "conceptName"
        ? "name"
        : name === "conceptAmount"
          ? "amount"
          : "quantity"
    set(
      "concepts",
      fields.concepts.map((concept, position) =>
        position === index
          ? {
              ...concept,
              [key]:
                key === "name"
                  ? value
                  : value.trim()
                    ? Number(value)
                    : Number.NaN,
            }
          : concept
      )
    )
  }
  function close() {
    if (!pending) onClose()
  }
  function confirmSave() {
    if (!pending) void save()
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    confirmSave()
  }
  function changeTitle(event: React.ChangeEvent<HTMLInputElement>) {
    set("title", event.target.value)
  }
  function changeClient(clientId: string | undefined) {
    set("clientId", clientId ?? "")
  }
  function changeDueDate(event: React.FormEvent<HTMLInputElement>) {
    set("dueDate", event.currentTarget.value)
  }
  function addTemplate(concept: PaymentConcept) {
    set("concepts", [...fields.concepts, concept])
  }
  function changePrepaid(value: string) {
    set("prepaidAmount", value.trim() ? Number(value) : 0)
  }
  function changeDescription(event: React.ChangeEvent<HTMLTextAreaElement>) {
    set("description", event.target.value)
  }
  function addConcept() {
    set("concepts", [...fields.concepts, { name: "", amount: 0, quantity: 1 }])
  }
  function removeConcept(index: number) {
    set(
      "concepts",
      fields.concepts.filter((_, position) => position !== index)
    )
  }
  function addProduct(product: Product) {
    set("concepts", [...fields.concepts, buildProductConcept(product)])
  }
  function generatePayment(method: PaymentMethod) {
    void save(method)
  }
  function openPayment(paymentId: string) {
    if (!pending) onOpenPayment(paymentId)
  }
  function changeVat(value: string) {
    set("vat", value.trim() ? Number(value) : Number.NaN)
  }

  return (
    <Modal
      isOpen
      onClose={close}
      title={
        commission
          ? `Editar ${singular}`
          : isFiring
            ? "Nueva cocción"
            : "Nuevo encargo"
      }
      maxWidth="xl"
      headerActions={
        <ConfirmAction
          onClick={confirmSave}
          isPending={pending}
          label="Guardar"
          pendingLabel="Guardando…"
        />
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <fieldset
          disabled={pending}
          className="space-y-5 text-zinc-900 dark:text-zinc-100"
        >
          <FormField id={`${id}-title`} label="Título" required>
            <input
              id={`${id}-title`}
              className={fieldClass}
              value={fields.title}
              required
              onChange={changeTitle}
            />
          </FormField>
          <ClientSelectorField
            value={fields.clientId}
            onChange={changeClient}
            label="Cliente (opcional)"
            onError={setError}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-due`} label="Fecha límite (opcional)">
              <input
                id={`${id}-due`}
                type="date"
                className={fieldClass}
                value={fields.dueDate ?? ""}
                onInput={changeDueDate}
              />
            </FormField>
            {!isFiring ? (
              <FormField id={`${id}-prepaid`} label="Anticipo (€)">
                <NumberStepperInput
                  id={`${id}-prepaid`}
                  value={
                    Number.isFinite(fields.prepaidAmount)
                      ? String(fields.prepaidAmount)
                      : ""
                  }
                  onValueChange={changePrepaid}
                  min={0}
                  step={5}
                  inputMode="decimal"
                  ariaLabel="Anticipo en euros"
                />
              </FormField>
            ) : null}
          </div>
          <FormField id={`${id}-description`} label="Descripción (opcional)">
            <textarea
              id={`${id}-description`}
              className={fieldClass}
              rows={3}
              value={fields.description ?? ""}
              onChange={changeDescription}
            />
          </FormField>
          <PaymentConceptsList
            formData={fields}
            allowEmpty={!commission?.paymentId}
            onChangeField={changeConcept}
            onAddConcept={addConcept}
            onRemoveConcept={removeConcept}
          />
          {isFiring ? (
            <FiringTemplateSelector onSelect={addTemplate} />
          ) : (
            <ProductSelector onSelect={addProduct} />
          )}
          <FormField id={`${id}-vat`} label="IVA (%)" required>
            <NumberStepperInput
              id={`${id}-vat`}
              min={0}
              max={100}
              step={1}
              required
              value={Number.isFinite(fields.vat) ? String(fields.vat) : ""}
              onValueChange={changeVat}
              ariaLabel="Porcentaje del IVA"
            />
          </FormField>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Los precios incluyen IVA. Total:{" "}
            {formatCurrency(
              computePaymentFinancials(fields.concepts, fields.vat).total
            )}
            .
            {!isFiring
              ? " El anticipo es informativo; el pago usa el total completo."
              : ""}
          </p>
        </fieldset>
        <div className="flex items-center justify-between gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <span>Pago</span>
          <PaymentActions
            name={fields.title || singular}
            paymentId={commission?.paymentId}
            isGenerating={pending}
            generationDisabled={pending || fields.concepts.length === 0}
            onGenerate={generatePayment}
            onOpen={openPayment}
          />
        </div>
        <button
          type="submit"
          className="sr-only"
          tabIndex={-1}
          disabled={pending}
        >
          Guardar
        </button>
      </form>
    </Modal>
  )
}
