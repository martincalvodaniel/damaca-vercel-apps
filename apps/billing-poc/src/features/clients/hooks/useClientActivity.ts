"use client"
import useSWR from "swr"
import { fetcher } from "@/lib/client/swr-fetcher"
import type { ClientActivity } from "@/lib/domain/services/client-activity"

export function buildClientActivityKey(id: string) {
  return ["/api/clients", "activity", id] as const
}
export function buildClientActivityUrl(id: string) {
  return `/api/clients/${encodeURIComponent(id)}/activity`
}
export function isClientActivityKey(key: unknown): boolean {
  return (
    Array.isArray(key) &&
    key.length === 3 &&
    key[0] === "/api/clients" &&
    key[1] === "activity" &&
    typeof key[2] === "string"
  )
}
export function useClientActivity(id: string) {
  return useSWR<ClientActivity>(
    buildClientActivityKey(id),
    () => fetcher<ClientActivity>(buildClientActivityUrl(id)),
    { keepPreviousData: false }
  )
}
