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
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 break-words font-semibold text-zinc-900 dark:text-zinc-100">
          {commission.title}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
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
      <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-zinc-600 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] dark:text-zinc-300">
        <div className="col-span-2 min-w-0 lg:col-span-1">
          <dt className="inline font-medium">Client:</dt>{" "}
          <dd className="inline break-words">
            {commission.clientId
              ? (clientName ?? "Unavailable client")
              : "No client"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Deadline:</dt>{" "}
          <dd className="inline">
            {commission.dueDate
              ? formatDate(commission.dueDate)
              : "No deadline"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Prepaid:</dt>{" "}
          <dd className="inline">{formatCurrency(commission.prepaidAmount)}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-1 lg:col-span-1">
          <dt className="shrink-0 font-medium">Total:</dt>
          <dd className="flex items-center gap-3">
            <span className="shrink-0">
              {formatCurrency(
                computePaymentFinancials(commission.concepts, commission.vat)
                  .total
              )}
            </span>
            <CommissionPaymentActions
              commission={commission}
              onOpen={onOpenPayment}
              onError={onError}
              onSuccess={onSuccess}
              isOpeningPayment={isOpeningPayment}
            />
          </dd>
        </div>
      </dl>
      {commission.paymentGeneration ? (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          Payment generation is pending. Retry to finish before editing or
          deleting.
        </p>
      ) : null}
    </article>
  )
})
