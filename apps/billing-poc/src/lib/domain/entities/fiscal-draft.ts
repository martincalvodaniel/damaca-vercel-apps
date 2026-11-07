export const FISCAL_MODELS = ["303", "130", "390"] as const
export type FiscalModel = (typeof FISCAL_MODELS)[number]

export interface FiscalReview {
  fingerprint: string
  date: string
  classification: "ordinary" | "excluded"
  vatDeductible: boolean
  incomeTaxDeductible: boolean
  reason: string
  reference?: string
  base?: number
  vat?: number
}

export interface FiscalInput {
  amount: number
  reason: string
}

export interface FiscalDraftSettings {
  reviews: Record<string, FiscalReview>
  inputs: Record<string, FiscalInput>
}

export interface FiscalDocument {
  id: string
  references: string[]
  paymentDate: string
  paymentTotal: number
  fingerprint: string
  direction: "income" | "outcome"
  rate: number
  base: number
  vat: number
  issue?: string
  review?: FiscalReview
}

export interface FiscalCell {
  code: string
  label: string
  amount: number
  documentIds: string[]
  pending?: boolean
}

export interface FiscalDraft {
  model: FiscalModel
  quarter: number
  year: number
  documents: FiscalDocument[]
  ignored: number
  cells: FiscalCell[]
  inputs: Record<string, FiscalInput>
  pending: string[]
}
