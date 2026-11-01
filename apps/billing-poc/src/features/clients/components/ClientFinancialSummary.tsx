"use client"
import dynamic from "next/dynamic"
import { memo, useMemo } from "react"
import SummaryCard from "@/components/ui/SummaryCard"
import { CHART_COLORS } from "@/config/constants"
import { computePaymentTotals } from "@/features/payments/components/month/monthlyPaymentsView-totals"
import type { Payment } from "@/lib/domain/entities/payment"
import { formatCurrency } from "@/lib/utils/formatters"

const DonutChart = dynamic(() => import("@/components/ui/DonutChart"), {
  ssr: false,
})

export default memo(function ClientFinancialSummary({
  payments,
}: {
  payments: Payment[]
}) {
  const totals = useMemo(() => computePaymentTotals(payments), [payments])
  const balance = totals.totalIncome - totals.totalOutcome
  return (
    <section aria-label="Resumen histórico del cliente" className="space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Resumen de todo el historial
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label={`Ingresos totales (${totals.incomeCount})`}
          value={formatCurrency(totals.totalIncome)}
          valueClassName="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          label={`Gastos totales (${totals.outcomeCount})`}
          value={formatCurrency(totals.totalOutcome)}
          valueClassName="text-red-600 dark:text-red-400"
        />
        <SummaryCard
          label="Saldo"
          value={formatCurrency(balance)}
          valueClassName={
            balance >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <DonutChart
          data={totals.incomeByTag}
          title="Ingresos por etiqueta"
          colors={CHART_COLORS}
        />
        <DonutChart
          data={totals.outcomeByTag}
          title="Gastos por etiqueta"
          colors={CHART_COLORS}
        />
      </div>
    </section>
  )
})
