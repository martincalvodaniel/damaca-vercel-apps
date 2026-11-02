import type { Metadata } from "next"
import { HouseholdTasksBoard } from "@/features/household-tasks/components/household-tasks-board"
import { getMadridIsoDate } from "@/features/meal-planning/week-utils"
import { requireAuthorizedSession } from "@/lib/auth/session"
import { loadHouseholdTasks } from "@/lib/db/household-tasks"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js route metadata must be exported alongside the page.
export const metadata: Metadata = {
  title: "Tareas del hogar",
  description:
    "Tareas recurrentes, calendario e histórico de ejecuciones del hogar.",
}

export default async function HouseholdTasksRoute() {
  await requireAuthorizedSession()
  const data = await loadHouseholdTasks()
  return <HouseholdTasksBoard data={data} initialToday={getMadridIsoDate()} />
}
