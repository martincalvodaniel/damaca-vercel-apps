export const controlClass =
  "inline-flex min-h-8 items-center justify-center gap-1 rounded-full border border-control-border bg-field py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
export const primaryClass =
  "inline-flex min-h-8 items-center justify-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
export const fieldClass =
  "min-h-11 w-full rounded-xl border border-control-border bg-field px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-ring"

const formatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
export function formatTaskDate(date: string) {
  return formatter.format(new Date(`${date}T00:00:00Z`))
}

const compactFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  timeZone: "UTC",
})
export function formatCompactTaskDate(date: string) {
  return compactFormatter.format(new Date(`${date}T00:00:00Z`))
}
