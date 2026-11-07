import type {
  FiscalDraftSettings,
  FiscalInput,
  FiscalReview,
} from "../entities/fiscal-draft"

export interface FiscalDraftRepository {
  load(owner: string, year: number): Promise<FiscalDraftSettings>
  review(
    owner: string,
    year: number,
    id: string,
    review: FiscalReview
  ): Promise<void>
  input(
    owner: string,
    year: number,
    key: string,
    input: FiscalInput
  ): Promise<void>
}
