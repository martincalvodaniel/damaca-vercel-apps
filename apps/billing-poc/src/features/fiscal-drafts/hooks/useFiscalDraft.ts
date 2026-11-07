"use client"

import useSWR, { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { fetcher } from "@/lib/client/swr-fetcher"
import type {
  FiscalDraft,
  FiscalModel,
} from "@/lib/domain/entities/fiscal-draft"
import type { DraftUpdate } from "@/schemas/fiscal-draft-validator"

const ENDPOINT = "/api/fiscal-drafts"

export function fiscalDraftKey(
  owner: string,
  model: FiscalModel,
  quarter: number
) {
  return [ENDPOINT, owner, model, quarter] as const
}

export function fiscalDraftUrl(model: FiscalModel, quarter: number) {
  return `${ENDPOINT}?year=2026&model=${model}&quarter=${quarter}`
}

export function isFiscalDraftKey(key: unknown, owner: string) {
  return Array.isArray(key) && key[0] === ENDPOINT && key[1] === owner
}

export function draftRequest(body: DraftUpdate): RequestInit {
  return {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}

export function useFiscalDraft(
  owner: string,
  model: FiscalModel,
  quarter: number
) {
  return useSWR(
    fiscalDraftKey(owner, model, quarter),
    () => fetcher<FiscalDraft>(fiscalDraftUrl(model, quarter)),
    { keepPreviousData: false, revalidateOnMount: true }
  )
}

export function useUpdateFiscalDraft(
  owner: string,
  model: FiscalModel,
  quarter: number
) {
  const { mutate } = useSWRConfig()
  return useSWRMutation(
    fiscalDraftKey(owner, model, quarter),
    (_key, { arg }: { arg: DraftUpdate }) =>
      fetcher<{ ok: boolean }>(
        fiscalDraftUrl(model, quarter),
        draftRequest(arg)
      ),
    { onSuccess: () => void mutate((key) => isFiscalDraftKey(key, owner)) }
  )
}
