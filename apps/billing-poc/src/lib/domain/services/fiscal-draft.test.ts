import { expect, test as it } from "bun:test"
import type { FiscalDraftSettings } from "../entities/fiscal-draft"
import type { InvoiceMetadata, Payment } from "../entities/payment"
import { calculateFiscalDraft, fiscalDocuments } from "./fiscal-draft"

const TODAY = "2027-01-01"
const empty = (): FiscalDraftSettings => ({ reviews: {}, inputs: {} })

function payment(id: string, options: Partial<Payment> = {}): Payment {
  const date = new Date("2026-02-01")
  return {
    _id: id,
    type: "income",
    hidden: false,
    date: "2026-02-01",
    vat: 21,
    netAmount: 100,
    vatAmount: 21,
    total: 121,
    concepts: [],
    createdAt: date,
    updatedAt: date,
    ...options,
  }
}

function invoice(id: string): InvoiceMetadata {
  return { type: "Invoice", id, generatedAt: new Date("2026-02-01") }
}

function confirm(
  records: Payment[],
  settings: FiscalDraftSettings,
  dates: Record<string, string> = {}
) {
  for (const document of fiscalDocuments(records, settings, TODAY).documents) {
    settings.reviews[document.id] = {
      fingerprint: document.fingerprint,
      classification: "ordinary",
      date: dates[document.id] ?? document.paymentDate,
      vatDeductible: false,
      incomeTaxDeductible: true,
      reason: "Verified",
    }
  }
}

it("ignores unfactured payments and receipts and deduplicates legacy references", () => {
  const settings = empty()
  const sale = payment("sale", {
    invoice: invoice("A"),
    invoices: [invoice("A")],
  })
  const records = [
    sale,
    payment("ignored"),
    payment("receipt", { invoices: [{ ...invoice("R"), type: "Receipt" }] }),
    payment("external", {
      invoices: [
        {
          type: "SimpleInvoice",
          link: "https://example.com/doc",
          generatedAt: sale.createdAt,
        },
      ],
    }),
  ]
  confirm(records, settings)
  const draft = calculateFiscalDraft(records, settings, "303", 2026, 1, TODAY)
  expect(draft.ignored).toBe(2)
  expect(draft.cells.find((cell) => cell.code === "09")).toMatchObject({
    amount: 42,
    documentIds: ["sale", "external"],
  })
})

it("keeps duplicated, ambiguous and rectificative documents out of ordinary totals", () => {
  const settings = empty()
  const records = [
    payment("first", { invoice: invoice("A") }),
    payment("second", { invoice: invoice("A") }),
    payment("multiple", { invoices: [invoice("B"), invoice("C")] }),
    payment("correction", {
      invoice: { ...invoice("D"), type: "RectificativeInvoice" },
    }),
  ]
  confirm(records, settings)
  const draft = calculateFiscalDraft(records, settings, "303", 2026, 1, TODAY)
  expect(draft.pending).toContain("4 facturas requieren revisión.")
  expect(draft.cells.find((cell) => cell.code === "09")).toMatchObject({
    amount: 0,
    documentIds: [],
  })
})

it("moves an invoice to its confirmed quarter and invalidates changed amounts", () => {
  const settings = empty()
  const sale = payment("sale", { invoice: invoice("A") })
  confirm([sale], settings, { sale: "2026-04-01" })
  expect(
    calculateFiscalDraft([sale], settings, "303", 2026, 1, TODAY).documents
  ).toHaveLength(0)
  expect(
    calculateFiscalDraft([sale], settings, "303", 2026, 2, TODAY).cells.find(
      (cell) => cell.code === "09"
    )?.amount
  ).toBe(21)
  const modified = { ...sale, vatAmount: 20 }
  expect(
    calculateFiscalDraft([modified], settings, "303", 2026, 1, TODAY).pending
  ).toContain("1 facturas requieren revisión.")
})

it("accumulates the 130 and subtracts prior installments without deducting VAT twice", () => {
  const settings = empty()
  const records = [
    payment("t1", { invoice: invoice("A") }),
    payment("t2", { date: "2026-04-05", invoice: invoice("B") }),
    payment("expense", {
      type: "outcome",
      date: "2026-04-05",
      netAmount: 10,
      vatAmount: 2.1,
      invoice: invoice("C"),
    }),
  ]
  confirm(records, settings)
  for (const [key, amount] of Object.entries({
    "previous-2": 20,
    "withheld-2": 0,
    "reduction-2": 0,
    "extraIncome-2": 0,
    "extraExpenses-2": 0,
  })) {
    settings.inputs[key] = { amount, reason: "Verified" }
  }
  const draft = calculateFiscalDraft(records, settings, "130", 2026, 2, TODAY)
  expect(draft.cells.find((cell) => cell.code === "01")?.amount).toBe(200)
  expect(draft.cells.find((cell) => cell.code === "02")?.amount).toBe(12.1)
  expect(draft.cells.find((cell) => cell.code === "07")?.amount).toBe(17.58)
  expect(draft.pending).toEqual([])
})

it("reconciles the 390 against all four declared results and marks differences", () => {
  const settings = empty()
  const sale = payment("sale", { date: "2026-10-01", invoice: invoice("A") })
  confirm([sale], settings)
  for (const [key, amount] of Object.entries({
    obligation: 1,
    declared1: 0,
    declared2: 0,
    declared3: 0,
    declared4: 21,
  })) {
    settings.inputs[key] = { amount, reason: "Verified" }
  }
  expect(
    calculateFiscalDraft([sale], settings, "390", 2026, 4, TODAY).pending
  ).toEqual([])
  settings.inputs.declared4.amount = 20
  expect(
    calculateFiscalDraft([sale], settings, "390", 2026, 4, TODAY).pending
  ).toContain("El 303 del T4 presenta diferencias.")
})

it("can resolve a duplicated link or select an invoice with confirmed amounts", () => {
  const settings = empty()
  const records = [
    payment("first", { invoice: invoice("A") }),
    payment("second", { invoice: invoice("A") }),
    payment("multiple", { invoices: [invoice("B"), invoice("C")] }),
  ]
  confirm(records, settings)
  settings.reviews.second.classification = "excluded"
  Object.assign(settings.reviews.multiple, {
    reference: "id:B",
    base: 50,
    vat: 10.5,
  })
  const draft = calculateFiscalDraft(records, settings, "303", 2026, 1, TODAY)
  expect(draft.cells.find((cell) => cell.code === "09")).toMatchObject({
    amount: 31.5,
    documentIds: ["first", "multiple"],
  })
})
