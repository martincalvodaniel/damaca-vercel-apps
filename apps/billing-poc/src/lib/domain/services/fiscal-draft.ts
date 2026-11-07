import type {
  FiscalCell,
  FiscalDocument,
  FiscalDraft,
  FiscalDraftSettings,
  FiscalModel,
} from "../entities/fiscal-draft"
import { getPaymentInvoices, type Payment } from "../entities/payment"

const CENTS = 100
const cents = (value: number) => Math.round(value * CENTS)
const euros = (value: number) => value / CENTS

export const FISCAL_INPUT_LABELS = {
  withheld: "Retenciones soportadas acumuladas",
  previous: "Pagos fraccionados anteriores computables (casilla 05)",
  extraIncome: "Otros ingresos fiscales acumulados ajenos al listado",
  extraExpenses: "Otros gastos fiscales acumulados ajenos al listado",
  reduction: "Minoraciones y deducciones aplicables al pago fraccionado",
  carry: "Cuotas de IVA anteriores aplicadas",
  declared1: "Resultado previo a compensaciones del 303 del T1",
  declared2: "Resultado previo a compensaciones del 303 del T2",
  declared3: "Resultado previo a compensaciones del 303 del T3",
  declared4: "Resultado previo a compensaciones del 303 del T4",
  obligation: "Obligación de presentar el 390",
} as const

export type FiscalInputName = keyof typeof FISCAL_INPUT_LABELS

export function fiscalInputKey(name: FiscalInputName, quarter: number) {
  return [
    "withheld",
    "previous",
    "reduction",
    "carry",
    "extraIncome",
    "extraExpenses",
  ].includes(name)
    ? `${name}-${quarter}`
    : name
}

export function fiscalInputs(model: FiscalModel): FiscalInputName[] {
  if (model === "130")
    return ["withheld", "previous", "reduction", "extraIncome", "extraExpenses"]
  if (model === "303") return ["carry"]
  return ["obligation", "declared1", "declared2", "declared3", "declared4"]
}

export function fiscalDocuments(
  payments: Payment[],
  settings: FiscalDraftSettings,
  today: string
) {
  const documents: FiscalDocument[] = []
  const occurrences = new Map<string, number>()
  let ignored = 0

  for (const payment of payments) {
    if (!payment._id || payment.date > today) continue
    const invoices = getPaymentInvoices(payment).filter(
      (invoice) => invoice.type !== "Receipt" && (invoice.id || invoice.link)
    )
    if (!invoices.length) {
      ignored += 1
      continue
    }
    const references = [
      ...new Set(
        invoices.map((invoice) =>
          invoice.id ? `id:${invoice.id}` : `url:${invoice.link}`
        )
      ),
    ].sort()
    const special =
      invoices.some((invoice) => invoice.type.startsWith("Rectificative")) ||
      !!payment.surcharge ||
      ![4, 10, 21].includes(payment.vat) ||
      payment.netAmount < 0 ||
      payment.vatAmount < 0
    const fingerprint = JSON.stringify([
      payment.date,
      payment.type,
      payment.vat,
      payment.netAmount,
      payment.vatAmount,
      payment.total,
      payment.surcharge,
      payment.clientId,
      invoices.map((invoice) => [
        invoice.id,
        invoice.link,
        invoice.type,
        invoice.generatedAt,
      ]),
    ])
    const candidate = settings.reviews[payment._id]
    const review =
      candidate?.fingerprint === fingerprint ? candidate : undefined
    const resolved =
      review?.reference &&
      references.includes(review.reference) &&
      review.base !== undefined &&
      review.vat !== undefined
    const selectedReferences =
      resolved && review?.reference ? [review.reference] : references
    if (review?.classification !== "excluded") {
      for (const ref of selectedReferences)
        occurrences.set(ref, (occurrences.get(ref) ?? 0) + 1)
    }
    documents.push({
      id: payment._id,
      references,
      paymentDate: payment.date,
      paymentTotal: payment.total,
      fingerprint,
      direction: payment.type,
      rate: payment.vat,
      base: resolved ? (review?.base ?? payment.netAmount) : payment.netAmount,
      vat: resolved ? (review?.vat ?? payment.vatAmount) : payment.vatAmount,
      issue: special
        ? "Operación especial o rectificativa pendiente de tratamiento fiscal."
        : references.length > 1 && !resolved
          ? "Varias facturas vinculadas al mismo pago."
          : undefined,
      review,
    })
  }

  for (const document of documents) {
    const references = document.review?.reference
      ? [document.review.reference]
      : document.references
    if (
      document.review?.classification !== "excluded" &&
      references.some((ref) => (occurrences.get(ref) ?? 0) > 1)
    ) {
      document.issue = "Factura vinculada a varios pagos."
    }
  }
  return { documents, ignored }
}

function quarterOf(date: string) {
  return Math.ceil(Number(date.slice(5, 7)) / 3)
}

export function calculateFiscalDraft(
  payments: Payment[],
  settings: FiscalDraftSettings,
  model: FiscalModel,
  year: number,
  quarter: number,
  today: string
): FiscalDraft {
  const { documents, ignored } = fiscalDocuments(payments, settings, today)
  const pending: string[] = []
  const cells: FiscalCell[] = []
  const inScope = (date: string) =>
    date.startsWith(`${year}-`) &&
    date <= today &&
    (model === "390" ||
      (model === "130"
        ? quarterOf(date) <= quarter
        : quarterOf(date) === quarter))
  const relevant = documents.filter((doc) =>
    inScope(doc.review?.date ?? doc.paymentDate)
  )
  const unresolved = relevant.filter((doc) => !doc.review || Boolean(doc.issue))
  if (unresolved.length)
    pending.push(`${unresolved.length} facturas requieren revisión.`)
  const confirmed = relevant.filter(
    (doc) => !doc.issue && doc.review?.classification === "ordinary"
  )
  const income = confirmed.filter((doc) => doc.direction === "income")
  const expenses = confirmed.filter((doc) => doc.direction === "outcome")
  const deductible = expenses.filter((doc) => doc.review?.vatDeductible)

  function total(
    code: string,
    label: string,
    docs: FiscalDocument[],
    amount: (doc: FiscalDocument) => number,
    adjustment = 0,
    missingAdjustment = false
  ) {
    const value = docs.reduce((sum, doc) => sum + amount(doc), adjustment)
    cells.push({
      code,
      label,
      amount: euros(value),
      documentIds: docs.map((doc) => doc.id),
      pending: missingAdjustment || unresolved.length > 0,
    })
    return value
  }

  function input(name: FiscalInputName) {
    return settings.inputs[fiscalInputKey(name, quarter)]
  }

  function result(
    code: string,
    label: string,
    value: number,
    blocked: boolean
  ) {
    cells.push({
      code,
      label,
      amount: euros(value),
      documentIds: confirmed.map((doc) => doc.id),
      pending: blocked || unresolved.length > 0,
    })
  }

  if (model === "130") {
    const extraIncome = input("extraIncome")
    const extraExpenses = input("extraExpenses")
    const missingActivity = !extraIncome || !extraExpenses
    const revenue = total(
      "01",
      "Ingresos computables",
      income,
      (doc) => cents(doc.base),
      cents(extraIncome?.amount ?? 0),
      !extraIncome
    )
    const costs = total(
      "02",
      "Gastos deducibles",
      expenses.filter((doc) => doc.review?.incomeTaxDeductible),
      (doc) =>
        cents(doc.base) + (doc.review?.vatDeductible ? 0 : cents(doc.vat)),
      cents(extraExpenses?.amount ?? 0),
      !extraExpenses
    )
    const profit = revenue - costs
    result("03", "Rendimiento neto", profit, missingActivity)
    const advance = Math.round(Math.max(0, profit) * 0.2)
    result("04", "20 % del rendimiento neto positivo", advance, missingActivity)
    const previous = input("previous")
    const withheld = input("withheld")
    const reduction = input("reduction")
    const missing = !previous || !withheld || !reduction || missingActivity
    if (missing)
      pending.push(
        "Confirma los datos adicionales del 130, incluso si son cero."
      )
    if (previous)
      result("05", FISCAL_INPUT_LABELS.previous, cents(previous.amount), false)
    if (withheld)
      result("06", FISCAL_INPUT_LABELS.withheld, cents(withheld.amount), false)
    result(
      "07",
      "Pago fraccionado antes de minoraciones",
      advance - cents(previous?.amount ?? 0) - cents(withheld?.amount ?? 0),
      missing
    )
    result(
      "—",
      "Estimación a ingresar después de minoraciones",
      Math.max(
        0,
        advance -
          cents(previous?.amount ?? 0) -
          cents(withheld?.amount ?? 0) -
          cents(reduction?.amount ?? 0)
      ),
      missing
    )
  } else {
    const codes =
      model === "303"
        ? [
            ["01", "03"],
            ["04", "06"],
            ["07", "09"],
          ]
        : [
            ["01", "02"],
            ["03", "04"],
            ["05", "06"],
          ]
    let outputVat = 0
    for (const [index, rate] of [4, 10, 21].entries()) {
      const group = income.filter((doc) => doc.rate === rate)
      total(codes[index][0], `Base devengada al ${rate} %`, group, (doc) =>
        cents(doc.base)
      )
      outputVat += total(
        codes[index][1],
        `Cuota devengada al ${rate} %`,
        group,
        (doc) => cents(doc.vat)
      )
    }
    total(
      model === "303" ? "28" : "48",
      "Base de operaciones interiores corrientes deducibles",
      deductible,
      (doc) => cents(doc.base)
    )
    const inputVat = total(
      model === "303" ? "29" : "49",
      "IVA deducible en operaciones interiores corrientes",
      deductible,
      (doc) => cents(doc.vat)
    )
    result(
      model === "303" ? "46" : "—",
      "Resultado del régimen general",
      outputVat - inputVat,
      false
    )
    if (model === "303") {
      const carry = input("carry")
      if (!carry)
        pending.push(
          "Confirma las cuotas anteriores aplicadas, incluso si son cero."
        )
      if (carry)
        result("78", FISCAL_INPUT_LABELS.carry, cents(carry.amount), false)
      if (carry && cents(carry.amount) > Math.max(0, outputVat - inputVat)) {
        pending.push(
          "La compensación aplicada supera el resultado positivo calculado."
        )
      }
      result(
        "—",
        "Resultado provisional tras compensaciones",
        outputVat - inputVat - cents(carry?.amount ?? 0),
        !carry
      )
    } else {
      const obligation = input("obligation")
      if (!obligation) pending.push("Confirma si corresponde presentar el 390.")
      if (obligation?.amount === 0)
        pending.push("Exoneración de presentar el 390 confirmada.")
      for (const index of [1, 2, 3, 4] as const) {
        const declared = input(`declared${index}`)
        const docs = confirmed.filter(
          (doc) => doc.review && quarterOf(doc.review.date) === index
        )
        const subtotal = docs.reduce(
          (sum, doc) =>
            sum +
            (doc.direction === "income"
              ? cents(doc.vat)
              : doc.review?.vatDeductible
                ? -cents(doc.vat)
                : 0),
          0
        )
        if (!declared)
          pending.push(
            `Pendiente el resultado declarado del 303 del T${index}.`
          )
        if (declared && subtotal !== cents(declared.amount))
          pending.push(`El 303 del T${index} presenta diferencias.`)
        if (declared)
          result(
            "—",
            `Diferencia con el 303 del T${index}`,
            subtotal - cents(declared.amount),
            false
          )
      }
    }
  }

  const endMonth = String(model === "390" ? 12 : quarter * 3).padStart(2, "0")
  if (today.slice(0, 7) <= `${year}-${endMonth}`)
    pending.push("Período todavía abierto o futuro.")
  return {
    model,
    quarter,
    year,
    documents: relevant,
    ignored,
    cells,
    pending,
    inputs: settings.inputs,
  }
}
