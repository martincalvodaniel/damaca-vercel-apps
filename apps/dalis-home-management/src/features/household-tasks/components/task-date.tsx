import { formatCompactTaskDate, formatTaskDate } from "./task-ui"

export function TaskDate({ date }: { date: string }) {
  return (
    <time dateTime={date} title={formatTaskDate(date)}>
      <span aria-hidden="true">{formatCompactTaskDate(date)}</span>
      <span className="sr-only">{formatTaskDate(date)}</span>
    </time>
  )
}
