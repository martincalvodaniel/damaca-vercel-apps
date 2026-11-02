import Link from "next/link"
import type { ReactNode } from "react"
import { EmptyState } from "@/components/ui/EmptyState"
import { PaymentsView } from "@/features/payments/components/month/MonthlyPaymentsView"
import type { Commission } from "@/lib/domain/entities/commission"
import type { ClientActivity } from "@/lib/domain/services/client-activity"
import { computePaymentFinancials } from "@/lib/domain/services/payment-calculator"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"

const itemClassName =
  "flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm text-zinc-900 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-blue-900/20"

function ActivitySection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <details className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <summary className="cursor-pointer rounded-lg px-4 py-3 font-semibold text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100">
        {title} ({count})
      </summary>
      <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-800">
        {count ? (
          children
        ) : (
          <EmptyState>No hay {title.toLowerCase()} de este cliente.</EmptyState>
        )}
      </div>
    </details>
  )
}

function CommissionEntries({
  items,
  resource,
}: {
  items: Commission[]
  resource: "commissions" | "firings"
}) {
  return items.map((item) => (
    <Link
      key={item._id}
      href={`/${resource}?commissionId=${encodeURIComponent(item._id ?? "")}`}
      className={itemClassName}
    >
      <span className="min-w-0 break-words font-medium">{item.title}</span>
      <span>
        {item.dueDate ? formatDate(item.dueDate) : "Sin fecha límite"}
      </span>
      <span>{item.paymentId ? "Con pago" : "Sin pago"}</span>
      <span className="font-semibold">
        {formatCurrency(
          computePaymentFinancials(item.concepts, item.vat).total
        )}
      </span>
    </Link>
  ))
}

export default function ClientActivitySections({
  activity,
}: {
  activity: ClientActivity
}) {
  return (
    <div className="space-y-4">
      <ActivitySection title="Pagos" count={activity.payments.length}>
        <PaymentsView
          payments={activity.payments}
          clientNameById={
            new Map([[activity.client._id ?? "", activity.client.name]])
          }
          selectedDate={new Date()}
          dateDisplay="full"
          exportFilename={`client-${activity.client._id}-payments.xlsx`}
        />
      </ActivitySection>
      <ActivitySection title="Encargos" count={activity.commissions.length}>
        <CommissionEntries
          items={activity.commissions}
          resource="commissions"
        />
      </ActivitySection>
      <ActivitySection title="Cocciones" count={activity.firings.length}>
        <CommissionEntries items={activity.firings} resource="firings" />
      </ActivitySection>
    </div>
  )
}
