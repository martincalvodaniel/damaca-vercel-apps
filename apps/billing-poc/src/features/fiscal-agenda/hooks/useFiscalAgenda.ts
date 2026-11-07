"use client"

import useSWR, { useSWRConfig } from "swr"
import useSWRMutation from "swr/mutation"
import { fetcher } from "@/lib/client/swr-fetcher"
import type { FiscalAgenda } from "@/lib/domain/entities/fiscal-task"
import type {
  FiscalCreate,
  FiscalUpdate,
} from "@/schemas/fiscal-agenda-validator"

const ENDPOINT = "/api/fiscal-agenda"

export function buildFiscalAgendaKey(owner: string, year: number) {
  return [ENDPOINT, owner, year] as const
}

export function buildFiscalAgendaUrl(year: number) {
  return `${ENDPOINT}?year=${year}`
}

export function isFiscalAgendaKey(key: unknown, owner: string) {
  return Array.isArray(key) && key[0] === ENDPOINT && key[1] === owner
}

export type FiscalMutation =
  | { method: "POST"; body: FiscalCreate }
  | { method: "PUT"; body: FiscalUpdate }
  | { method: "DELETE"; id: string }

export function buildFiscalRequest(
  action: FiscalMutation
): [string, RequestInit] {
  if (action.method === "DELETE") {
    return [
      `${ENDPOINT}?id=${encodeURIComponent(action.id)}`,
      { method: "DELETE" },
    ]
  }
  return [
    ENDPOINT,
    {
      method: action.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action.body),
    },
  ]
}

export function useFiscalAgenda(owner: string, year: number) {
  return useSWR(
    buildFiscalAgendaKey(owner, year),
    () => fetcher<FiscalAgenda>(buildFiscalAgendaUrl(year)),
    { keepPreviousData: false }
  )
}

export function useFiscalAgendaMutation(owner: string, year: number) {
  const { mutate } = useSWRConfig()
  return useSWRMutation(
    buildFiscalAgendaKey(owner, year),
    async (_key, { arg }: { arg: FiscalMutation }) => {
      const [url, init] = buildFiscalRequest(arg)
      return fetcher<{ ok: boolean }>(url, init)
    },
    { onSuccess: () => void mutate((key) => isFiscalAgendaKey(key, owner)) }
  )
}
