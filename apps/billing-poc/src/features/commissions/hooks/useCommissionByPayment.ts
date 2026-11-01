"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/client/swr-fetcher"
import type { CommissionResource } from "../components/CommissionScope"

export interface CommissionByPaymentResponse {
  commission: { id: string; title: string } | null
}
export function buildCommissionByPaymentKey(
  id: string,
  resource: CommissionResource = "commissions"
) {
  return [`/api/${resource}/payment`, id] as const
}
export function buildCommissionByPaymentUrl(
  id: string,
  resource: CommissionResource = "commissions"
) {
  return `/api/${resource}/payment/${encodeURIComponent(id)}`
}
export function isCommissionByPaymentKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key.length === 2 &&
    (key[0] === "/api/commissions/payment" ||
      key[0] === "/api/firings/payment") &&
    typeof key[1] === "string"
  )
}
export function useCommissionByPayment(
  id: string | null,
  resource: CommissionResource = "commissions"
) {
  const { data, error, isLoading } = useSWR<CommissionByPaymentResponse>(
    id ? buildCommissionByPaymentKey(id, resource) : null,
    () => fetcher(buildCommissionByPaymentUrl(id ?? "", resource))
  )
  return { commission: data?.commission ?? null, error, isLoading }
}
