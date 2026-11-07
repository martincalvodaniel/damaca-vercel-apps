import type { FiscalTask } from "@/lib/domain/entities/fiscal-task"

export interface FiscalTaskRepository {
  list(owner: string, year: number): Promise<FiscalTask[]>
  incorporate(owner: string, task: FiscalTask): Promise<void>
  create(owner: string, task: FiscalTask): Promise<void>
  find(owner: string, id: string): Promise<FiscalTask | null>
  replace(
    owner: string,
    previous: FiscalTask,
    task: FiscalTask
  ): Promise<boolean>
  remove(owner: string, id: string): Promise<boolean>
}
