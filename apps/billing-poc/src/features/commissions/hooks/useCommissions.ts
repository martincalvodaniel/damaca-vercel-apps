"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/client/swr-fetcher"
import type { Commission } from "@/lib/domain/entities/commission"

export function buildCommissionsKey() {
  return ["/api/commissions"] as const
}
export function buildCommissionsUrl() {
  return "/api/commissions"
}
export function buildCommissionKey(id: string) {
  return ["/api/commissions", id] as const
}
export function buildCommissionUrl(id: string) {
  return `/api/commissions/${encodeURIComponent(id)}`
}
export function isCommissionsKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key[0] === "/api/commissions" &&
    (key.length === 1 || (key.length === 2 && typeof key[1] === "string"))
  )
}
export function useCommissions() {
  const { data, error, isLoading } = useSWR<{ commissions: Commission[] }>(
    buildCommissionsKey(),
    () => fetcher(buildCommissionsUrl())
  )
  return { commissions: data?.commissions ?? [], error, isLoading }
}
export function useCommission(id: string | null) {
  const { data, error, isLoading } = useSWR<{ commission: Commission }>(
    id ? buildCommissionKey(id) : null,
    () => fetcher(buildCommissionUrl(id ?? ""))
  )
  return { commission: data?.commission, error, isLoading }
}
