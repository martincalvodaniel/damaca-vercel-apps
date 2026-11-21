"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function RememberedFilters({
  accountKey,
  path,
  applied,
  restore,
}: {
  accountKey: string
  path: "/" | "/topics"
  applied?: string
  restore: boolean
}) {
  const router = useRouter()
  useEffect(() => {
    const key = `digest:filters:v1:${accountKey}:${path}`
    try {
      if (restore) {
        const saved = localStorage.getItem(key)
        if (saved?.startsWith(`${path}?`) && !saved.includes("#")) {
          router.replace(saved, { scroll: false })
        }
      } else if (applied === "") {
        localStorage.removeItem(key)
      } else if (applied) {
        localStorage.setItem(key, applied)
      }
    } catch {
      // Filters continue to work through the URL without storage.
    }
  }, [accountKey, applied, path, restore, router])
  return null
}
