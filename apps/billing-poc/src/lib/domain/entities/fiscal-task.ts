export interface FiscalTask {
  id: string
  title: string
  model: string
  period: string
  exercise?: number
  filingDue?: string
  debitDue?: string
  paymentDue?: string
  paymentDueOverride?: string
  filedOn?: string
  paidOn?: string
  notes?: string
  receipt?: string
  source?: string
  catalogVersion?: string
  dueYear: number
}

export type ManualFiscalTask = Omit<
  FiscalTask,
  "id" | "source" | "catalogVersion" | "dueYear" | "paymentDueOverride"
>

export interface FiscalAgenda {
  tasks: FiscalTask[]
  suggestions: FiscalTask[]
  hasCatalog: boolean
}
