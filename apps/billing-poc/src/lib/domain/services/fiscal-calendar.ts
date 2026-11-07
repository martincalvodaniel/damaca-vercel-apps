import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"

const SOURCE =
  "https://sede.agenciatributaria.gob.es/Sede/ayuda/calendario-contribuyente/calendario-contribuyente-2026.html"
const VERSION = "2026-10-07"

export function madridDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)?.value)
    .join("-")
}

export function fiscalDue(task: FiscalTask): string {
  const open = openDeadlines(task).sort()[0]
  if (open) return open
  return task.filingDue ?? task.paymentDue ?? ""
}

export function fiscalPaymentDue(task: FiscalTask) {
  return task.paymentDueOverride ?? task.paymentDue
}

function openDeadlines(task: FiscalTask) {
  return [
    task.filedOn ? undefined : task.filingDue,
    task.paidOn ? undefined : fiscalPaymentDue(task),
  ].filter((date) => date !== undefined)
}

export function fiscalStatus(task: FiscalTask, today: string) {
  const openDates = openDeadlines(task)
  if (openDates.some((date) => date < today)) return "Vencido"
  return openDates.length ? "Pendiente" : "Completado"
}

export function hasFiscalCatalog(year: number) {
  return year === 2026
}

export function fiscalSuggestions(year: number): FiscalTask[] {
  if (!hasFiscalCatalog(year)) return []
  const tasks: FiscalTask[] = []
  function add(
    model: string,
    exercise: number,
    period: string,
    deadlines: Pick<FiscalTask, "filingDue" | "debitDue" | "paymentDue">
  ) {
    tasks.push({
      id: `official-${model}-${exercise}-${period}`,
      title: `Modelo ${model}`,
      model,
      exercise,
      period,
      dueYear: year,
      source: SOURCE,
      catalogVersion: VERSION,
      ...deadlines,
    })
  }

  for (const model of ["111", "115", "130", "131", "303"]) {
    const withholding = model === "111" || model === "115"
    add(model, 2025, "4T", {
      filingDue: withholding ? "2026-01-20" : "2026-01-30",
      debitDue: withholding ? "2026-01-15" : "2026-01-27",
    })
    for (const [quarter, month] of ["04", "07", "10"].entries()) {
      add(model, 2026, `${quarter + 1}T`, {
        filingDue: `2026-${month}-20`,
        debitDue: `2026-${month}-15`,
      })
    }
  }

  for (const [model, filingDue] of [
    ["180", "2026-02-02"],
    ["190", "2026-02-02"],
    ["347", "2026-03-02"],
    ["390", "2026-01-30"],
  ]) {
    add(model, 2025, "Anual", { filingDue })
  }
  add("100", 2025, "Anual", {
    filingDue: "2026-06-30",
    debitDue: "2026-06-25",
  })
  add("102", 2025, "Segundo plazo", { paymentDue: "2026-11-05" })
  return tasks
}

export function fiscalDatesChanged(saved: FiscalTask, official: FiscalTask) {
  return (
    saved.filingDue !== official.filingDue ||
    saved.debitDue !== official.debitDue ||
    saved.paymentDue !== official.paymentDue
  )
}
