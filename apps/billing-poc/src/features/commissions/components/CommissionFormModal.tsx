"use client"
import { useId, useState } from "react"
import ClientSelectorField from "@/components/shared/ClientSelectorField"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import { ConfirmFooter, Modal } from "@/components/ui/Modal"
import {
  useCreateCommission,
  useUpdateCommission,
} from "@/features/commissions/hooks/useCommissionMutations"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import PaymentConceptsList from "@/features/payments/components/month/PaymentConceptsList"
import { useProducts } from "@/features/products/hooks/useProducts"
import type {
  Commission,
  CommissionFields,
  CommissionPaymentStatus,
} from "@/lib/domain/entities/commission"
import { computePaymentFinancials } from "@/lib/domain/services/payment-calculator"
import { formatCurrency } from "@/lib/utils/formatters"
import { createCommissionSchema } from "@/schemas/commission-validator"
import { buildCommissionPatch, buildProductConcept } from "./commission-form"

const fieldClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"

export default function CommissionFormModal({
  commission,
  onClose,
  onSaved,
}: {
  commission?: Commission
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const id = useId()
  const [original] = useState(commission)
  const [fields, setFields] = useState<CommissionFields>(() => ({
    title: commission?.title ?? "",
    description: commission?.description ?? "",
    clientId: commission?.clientId ?? "",
    dueDate: commission?.dueDate ?? "",
    paymentStatus: commission?.paymentStatus ?? 0,
    concepts: commission?.concepts.map((concept) => ({ ...concept })) ?? [],
    vat: commission?.vat ?? 21,
  }))
  const [error, setError] = useState<string | null>(null)
  const create = useCreateCommission()
  const update = useUpdateCommission()
  const { products, error: productsError } = useProducts()
  const pending = create.isMutating || update.isMutating
  const set = <K extends keyof CommissionFields>(
    key: K,
    value: CommissionFields[K]
  ) => setFields((previous) => ({ ...previous, [key]: value }))
  const save = async () => {
    setError(null)
    const parsed = createCommissionSchema.safeParse(fields)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid commission")
      return
    }
    try {
      const result = commission?._id
        ? await update.trigger({
            ...buildCommissionPatch(original ?? commission, parsed.data),
            id: commission._id,
          })
        : await create.trigger(parsed.data)
      onSaved(
        result.paymentSync === "invoiced"
          ? "Commission saved. The invoiced payment was preserved and was not synchronized."
          : "Commission saved"
      )
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to save commission"))
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
  function changeStatus(event: React.ChangeEvent<HTMLSelectElement>) {
    set("paymentStatus", Number(event.target.value) as CommissionPaymentStatus)
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
  function changeProduct(event: React.ChangeEvent<HTMLSelectElement>) {
    const product = products.find(
      (product) => product._id === event.target.value
    )
    if (product)
      set("concepts", [...fields.concepts, buildProductConcept(product)])
  }
  function changeVat(event: React.ChangeEvent<HTMLInputElement>) {
    set("vat", event.target.value ? Number(event.target.value) : Number.NaN)
  }
  return (
    <Modal
      isOpen
      onClose={close}
      title={commission ? "Edit Commission" : "New Commission"}
      maxWidth="xl"
      stickyHeader
      stickyFooter
      footer={
        <ConfirmFooter
          onConfirm={confirmSave}
          onCancel={onClose}
          isPending={pending}
          confirmLabel="Save"
          pendingLabel="Saving…"
        />
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        {error ? <ErrorBanner>{error}</ErrorBanner> : null}
        <fieldset
          disabled={pending}
          className="space-y-5 text-zinc-900 dark:text-zinc-100"
        >
          <label className="block space-y-1" htmlFor={`${id}-title`}>
            <span>Title</span>
            <input
              id={`${id}-title`}
              className={fieldClass}
              value={fields.title}
              required
              onChange={changeTitle}
            />
          </label>
          <ClientSelectorField
            value={fields.clientId}
            onChange={changeClient}
            label="Client (optional)"
            onError={setError}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1" htmlFor={`${id}-due`}>
              <span>Delivery deadline (optional)</span>
              <input
                id={`${id}-due`}
                type="date"
                className={fieldClass}
                value={fields.dueDate ?? ""}
                onInput={changeDueDate}
              />
            </label>
            <label className="block space-y-1" htmlFor={`${id}-status`}>
              <span>Payment progress (manual)</span>
              <select
                id={`${id}-status`}
                className={fieldClass}
                value={fields.paymentStatus}
                onChange={changeStatus}
              >
                <option value={0}>0%</option>
                <option value={50}>50%</option>
                <option value={100}>100%</option>
              </select>
            </label>
          </div>
          <label className="block space-y-1" htmlFor={`${id}-description`}>
            <span>Description (optional)</span>
            <textarea
              id={`${id}-description`}
              className={fieldClass}
              rows={3}
              value={fields.description ?? ""}
              onChange={changeDescription}
            />
          </label>
          <PaymentConceptsList
            formData={fields}
            allowEmpty={!commission?.paymentId}
            onChangeField={changeConcept}
            onAddConcept={addConcept}
            onRemoveConcept={removeConcept}
          />
          <label className="block space-y-1" htmlFor={`${id}-product`}>
            <span>Add a product (no stock change)</span>
            <select
              id={`${id}-product`}
              className={fieldClass}
              value=""
              onChange={changeProduct}
            >
              <option value="">Select a product…</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} · {formatCurrency(product.finalPrice)}
                </option>
              ))}
            </select>
          </label>
          {productsError ? (
            <ErrorBanner>
              Products could not be loaded. You can still add free concepts.
            </ErrorBanner>
          ) : null}
          <label className="block space-y-1" htmlFor={`${id}-vat`}>
            <span>VAT (%)</span>
            <input
              id={`${id}-vat`}
              type="number"
              className={fieldClass}
              min={0}
              max={100}
              step="any"
              required
              value={Number.isFinite(fields.vat) ? fields.vat : ""}
              onChange={changeVat}
            />
          </label>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Prices include VAT. Total:{" "}
            {formatCurrency(
              computePaymentFinancials(fields.concepts, fields.vat).total
            )}
            . Payment progress is independent of the generated payment.
          </p>
        </fieldset>
        <button
          type="submit"
          className="sr-only"
          tabIndex={-1}
          disabled={pending}
        >
          Save
        </button>
      </form>
    </Modal>
  )
}
