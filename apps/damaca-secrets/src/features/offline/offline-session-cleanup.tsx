"use client"

import { useEffect } from "react"
import { clearOfflineVault } from "@/lib/offline/storage"

export function OfflineSessionCleanup() {
  useEffect(() => {
    void clearOfflineVault().catch(() => {})
  }, [])
  return null
}
