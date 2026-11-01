"use client"
import { memo } from "react"
import { IconButton } from "@/components/ui/IconButton"
import { PencilIcon } from "@/components/ui/icons/PencilIcon"
import { TrashIcon } from "@/components/ui/icons/TrashIcon"
import type { Commission } from "@/lib/domain/entities/commission"
import { computePaymentFinancials } from "@/lib/domain/services/payment-calculator"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import CommissionPaymentActions from "./CommissionPaymentActions"

export default memo(function CommissionCard({
  commission,
  clientName,
  onEdit,
  onDelete,
  onOpenPayment,
  onError,
  onSuccess,
  isOpeningPayment,
}: {
  commission: Commission
  clientName?: string
  onEdit: (commission: Commission) => void
  onDelete: (commission: Commission) => void
  onOpenPayment: (id: string) => void
  onError: (message: string) => void
  onSuccess: (message: string) => void
  isOpeningPayment?: boolean
}) {
  function edit() {
    onEdit(commission)
  }
  function remove() {
    onDelete(commission)
  }
  return (
    <article
      key={commission._id}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-2">
          <h2 className="break-words font-semibold text-zinc-900 dark:text-zinc-100">
            {commission.title}
          </h2>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div>
              <dt className="font-medium">Client</dt>
              <dd>
                {commission.clientId
                  ? (clientName ?? "Unavailable client")
                  : "No client"}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Delivery deadline</dt>
              <dd>
                {commission.dueDate
                  ? formatDate(commission.dueDate)
                  : "No deadline"}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Payment progress</dt>
              <dd>{commission.paymentStatus}%</dd>
            </div>
            <div>
              <dt className="font-medium">Total</dt>
              <dd>
                {formatCurrency(
                  computePaymentFinancials(commission.concepts, commission.vat)
                    .total
                )}
              </dd>
            </div>
          </dl>
          {commission.paymentGeneration ? (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Payment generation is pending. Retry to finish before editing or
              deleting.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <IconButton
            disabled={Boolean(commission.paymentGeneration)}
            onClick={edit}
            ariaLabel={`Edit commission ${commission.title}`}
            title="Edit commission"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            variant="danger"
            disabled={Boolean(commission.paymentGeneration)}
            onClick={remove}
            ariaLabel={`Delete commission ${commission.title}`}
            title="Delete commission"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
      <div className="mt-4">
        <CommissionPaymentActions
          commission={commission}
          onOpen={onOpenPayment}
          onError={onError}
          onSuccess={onSuccess}
          isOpeningPayment={isOpeningPayment}
        />
      </div>
    </article>
  )
})
