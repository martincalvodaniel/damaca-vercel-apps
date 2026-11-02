export interface TaskOccurrence {
  date: string
  completedDate?: string
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function taskStatus(
  intervalDays: number | null,
  occurrences: readonly TaskOccurrence[],
  today: string
) {
  const lastExecution = occurrences
    .flatMap((entry) => (entry.completedDate ? [entry.completedDate] : []))
    .sort()
    .at(-1)
  const nextScheduled = occurrences
    .filter((entry) => !entry.completedDate && entry.date >= today)
    .map((entry) => entry.date)
    .sort()[0]
  if (!lastExecution || !intervalDays)
    return {
      lastExecution,
      nextScheduled,
      dueDate: undefined,
      state: "unknown" as const,
    }
  const dueDate = addDays(lastExecution, intervalDays)
  const warningDate = addDays(lastExecution, Math.ceil(intervalDays * 0.8))
  const covered = nextScheduled !== undefined && nextScheduled <= dueDate
  const state =
    today >= dueDate
      ? "overdue"
      : today >= warningDate && !covered
        ? "warning"
        : "normal"
  return { lastExecution, nextScheduled, dueDate, state }
}

export function dayStatus(occurrences: readonly TaskOccurrence[]) {
  return occurrences.length === 0
    ? "empty"
    : occurrences.some((entry) => !entry.completedDate)
      ? "pending"
      : "completed"
}

export function monthDays(month: string): Array<string | null> {
  const first = new Date(`${month}-01T00:00:00Z`)
  const offset = (first.getUTCDay() + 6) % 7
  const count = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)
  ).getUTCDate()
  return [
    ...Array<string | null>(offset).fill(null),
    ...Array.from({ length: count }, (_, index) =>
      addDays(`${month}-01`, index)
    ),
  ]
}
