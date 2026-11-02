export interface HouseholdTask {
  id: string
  name: string
  intervalDays: number | null
  archived: boolean
}

export interface HouseholdTaskOccurrence {
  id: string
  taskId: string
  date: string
  completedDate?: string
  completedBy?: "Dani" | "Pali" | "Ambos"
  wasScheduled: boolean
}

export interface HouseholdTasksData {
  tasks: HouseholdTask[]
  occurrences: HouseholdTaskOccurrence[]
}

export type HouseholdTaskActionResult =
  | { success: true }
  | { success: false; message: string }
