"use client"
import { createContext, useContext } from "react"

export type CommissionResource = "commissions" | "firings"
export const CommissionScope = createContext<CommissionResource>("commissions")
export function useCommissionScope() {
  const resource = useContext(CommissionScope)
  return {
    resource,
    isFiring: resource === "firings",
    singular: resource === "firings" ? "cocción" : "encargo",
    plural: resource === "firings" ? "cocciones" : "encargos",
    title: resource === "firings" ? "Cocciones" : "Encargos",
  }
}
