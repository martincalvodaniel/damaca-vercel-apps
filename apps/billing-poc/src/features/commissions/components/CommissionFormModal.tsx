"use client"
import { useId, useState } from "react"
import ClientSelectorField from "@/components/shared/ClientSelectorField"
import ProductSelector from "@/components/shared/ProductSelector"
import { ErrorBanner } from "@/components/ui/ErrorBanner"
import FormField from "@/components/ui/FormField"
import { ConfirmFooter, Modal } from "@/components/ui/Modal"
import NumberStepperInput from "@/components/ui/NumberStepperInput"
import {
  useCreateCommission,
  useUpdateCommission,
} from "@/features/commissions/hooks/useCommissionMutations"
import { extractErrorMessage } from "@/features/events/components/attendeesPanel-utils"
import PaymentConceptsList from "@/features/payments/components/month/PaymentConceptsList"
import type {
  Commission,
  CommissionFields,
} from "@/lib/domain/entities/commission"
import type { Product } from "@/lib/domain/entities/product"
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
    prepaidAmount: commission?.prepaidAmount ?? 0,
    concepts: commission?.concepts.map((concept) => ({ ...concept })) ?? [],
    vat: commission?.vat ?? 21,
  }))
  const [error, setError] = useState<string | null>(null)
  const create = useCreateCommission()
  const update = useUpdateCommission()
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
  function changeVat(value: string) {
    set("vat", value.trim() ? Number(value) : Number.NaN)
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
          <FormField id={`${id}-title`} label="Title" required>
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
            label="Client (optional)"
            onError={setError}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={`${id}-due`} label="Deadline (optional)">
              <input
                id={`${id}-due`}
                type="date"
                className={fieldClass}
                value={fields.dueDate ?? ""}
                onInput={changeDueDate}
              />
            </FormField>
            <FormField id={`${id}-prepaid`} label="Prepaid (€)">
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
                ariaLabel="Prepaid amount in euros"
              />
            </FormField>
          </div>
          <FormField id={`${id}-description`} label="Description (optional)">
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
          <ProductSelector onSelect={addProduct} />
          <FormField id={`${id}-vat`} label="VAT (%)" required>
            <NumberStepperInput
              id={`${id}-vat`}
              min={0}
              max={100}
              step={1}
              required
              value={Number.isFinite(fields.vat) ? String(fields.vat) : ""}
              onValueChange={changeVat}
              ariaLabel="VAT percentage"
            />
          </FormField>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Prices include VAT. Total:{" "}
            {formatCurrency(
              computePaymentFinancials(fields.concepts, fields.vat).total
            )}
            . Prepaid is informational; payments use the full total.
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
