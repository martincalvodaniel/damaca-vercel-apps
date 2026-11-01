"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/client/swr-fetcher"
import type { Commission } from "@/lib/domain/entities/commission"
import {
  type CommissionResource,
  useCommissionScope,
} from "../components/CommissionScope"

export function buildCommissionsKey(
  resource: CommissionResource = "commissions"
) {
  return [`/api/${resource}`] as const
}
export function buildCommissionsUrl(
  resource: CommissionResource = "commissions"
) {
  return `/api/${resource}`
}
export function buildCommissionKey(
  id: string,
  resource: CommissionResource = "commissions"
) {
  return [`/api/${resource}`, id] as const
}
export function buildCommissionUrl(
  id: string,
  resource: CommissionResource = "commissions"
) {
  return `/api/${resource}/${encodeURIComponent(id)}`
}
export function isCommissionsKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    (key[0] === "/api/commissions" || key[0] === "/api/firings") &&
    (key.length === 1 || (key.length === 2 && typeof key[1] === "string"))
  )
}
export function useCommissions() {
  const { resource } = useCommissionScope()
  const { data, error, isLoading } = useSWR<{ commissions: Commission[] }>(
    buildCommissionsKey(resource),
    () => fetcher(buildCommissionsUrl(resource))
  )
  return { commissions: data?.commissions ?? [], error, isLoading }
}
export function useCommission(id: string | null) {
  const { resource } = useCommissionScope()
  const { data, error, isLoading } = useSWR<{ commission: Commission }>(
    id ? buildCommissionKey(id, resource) : null,
    () => fetcher(buildCommissionUrl(id ?? "", resource))
  )
  return { commission: data?.commission, error, isLoading }
}
