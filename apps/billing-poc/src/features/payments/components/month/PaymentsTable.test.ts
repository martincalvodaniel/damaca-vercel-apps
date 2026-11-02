import { expect, test as it } from "bun:test"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { Payment } from "@/lib/domain/entities/payment"
import { formatDate } from "@/lib/utils/formatters"
import PaymentsTable from "./PaymentsTable"

const noop = () => {}
const payment: Payment = {
  _id: "payment",
  type: "income",
  hidden: false,
  date: "2025-01-15",
  clientId: "client",
  concepts: [{ name: "Class", amount: 121, quantity: 1 }],
  vat: 21,
  netAmount: 100,
  vatAmount: 21,
  total: 121,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function renderTable(dateDisplay: "day" | "full") {
  const payments = [payment, { ...payment, _id: "new", date: "2026-02-15" }]
  return renderToStaticMarkup(
    createElement(PaymentsTable, {
      payments,
      filteredPayments: payments,
      selectedDate: new Date(2026, 1, 1),
      dateDisplay,
      error: null,
      onRowClick: noop,
      onDeleteClick: noop,
      onDuplicateClick: noop,
      typeFilter: "all",
      hasInvoiceFilter: "all",
      hasReceiptFilter: "all",
      selectedTags: [],
      onTypeFilterToggle: noop,
      onInvoiceFilterToggle: noop,
      onReceiptFilterToggle: noop,
      onTagFilterToggle: noop,
      clientNameById: new Map([["client", "Client"]]),
      onClientClick: noop,
    })
  )
}

it("client history keeps dates across years and the monthly table controls", () => {
  const html = renderTable("full")
  expect(html).toContain(">Fecha<")
  expect(html).toContain(formatDate("2025-01-15"))
  expect(html).toContain(formatDate("2026-02-15"))
  for (const label of [
    "Compacto",
    "Todo",
    "Duplicar pago",
    "Eliminar pago",
    "Filtrar pagos sin factura",
    "Exportar pagos del cliente a Excel",
  ]) {
    expect(html).toContain(label)
  }
})

it("monthly date cells retain their day-only presentation", () => {
  const html = renderTable("day")
  expect(html).toContain(">Día<")
  expect(html).not.toContain(formatDate(payment.date))
  expect(html).toContain(">15<")
})
