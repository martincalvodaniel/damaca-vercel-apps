"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/client/swr-fetcher"

export interface CommissionByPaymentResponse {
  commission: { id: string; title: string } | null
}
export function buildCommissionByPaymentKey(id: string) {
  return ["/api/commissions/payment", id] as const
}
export function buildCommissionByPaymentUrl(id: string) {
  return `/api/commissions/payment/${encodeURIComponent(id)}`
}
export function isCommissionByPaymentKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key.length === 2 &&
    key[0] === "/api/commissions/payment" &&
    typeof key[1] === "string"
  )
}
export function useCommissionByPayment(id: string | null) {
  const { data, error, isLoading } = useSWR<CommissionByPaymentResponse>(
    id ? buildCommissionByPaymentKey(id) : null,
    () => fetcher(buildCommissionByPaymentUrl(id ?? ""))
  )
  return { commission: data?.commission ?? null, error, isLoading }
}
