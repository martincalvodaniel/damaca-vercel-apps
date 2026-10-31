import { civilDateToUtc } from "@/lib/calendar/civil-date"
import type { TaskPlacement } from "@/types/preferences"

const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeZone: "UTC",
})

export function PlacementScopeLabel({
  scope,
  date,
}: Pick<TaskPlacement, "scope" | "date">) {
  if (scope === "undated") return <>Sin fecha</>
  return (
    <>
      {scope === "overdue" ? "Atrasadas; día de referencia" : "Día"}{" "}
      {dayFormatter.format(civilDateToUtc(date))}
    </>
  )
}
