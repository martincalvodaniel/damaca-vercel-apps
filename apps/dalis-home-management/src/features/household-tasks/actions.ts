"use server"

import { revalidatePath } from "next/cache"
import { getMadridIsoDate } from "@/features/meal-planning/week-utils"
import { requireAuthorizedSession } from "@/lib/auth/session"
import {
  HouseholdTaskConflict,
  mutateHouseholdTask,
} from "@/lib/db/household-tasks"
import { parseHouseholdTaskCommand } from "@/schemas/household-task"
import type { HouseholdTaskActionResult } from "@/types/household-task"

export async function householdTaskAction(
  input: unknown
): Promise<HouseholdTaskActionResult> {
  await requireAuthorizedSession()
  const parsed = parseHouseholdTaskCommand(input, getMadridIsoDate())
  if (!parsed.success)
    return {
      success: false,
      message:
        "Revisa los datos. Las fechas de ejecución no pueden ser futuras.",
    }
  try {
    await mutateHouseholdTask(parsed.data)
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof HouseholdTaskConflict
          ? error.message
          : "No se ha podido guardar el cambio. Revisa el estado y vuelve a intentarlo.",
    }
  }
  revalidatePath("/household-tasks")
  return { success: true }
}
