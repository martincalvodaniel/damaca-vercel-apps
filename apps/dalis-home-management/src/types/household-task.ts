export interface HouseholdTask {
  id: string
  name: string
  intervalDays: number
  archived: boolean
}

export interface HouseholdTaskOccurrence {
  id: string
  taskId: string
  date: string
  completedDate?: string
  wasScheduled: boolean
}

export interface HouseholdTasksData {
  tasks: HouseholdTask[]
  occurrences: HouseholdTaskOccurrence[]
}

export type HouseholdTaskActionResult =
  | { success: true }
  | { success: false; message: string }
