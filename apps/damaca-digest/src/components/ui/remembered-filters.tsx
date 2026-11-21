"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { rememberFilters } from "@/features/filters/filter-actions"
import {
  emptyFilterHref,
  type FilterPath,
  filterStorageKey,
  normalizeRememberedHref,
} from "@/features/filters/remembered-query"

export function RememberedFilters({
  accountKey,
  path,
  applied,
}: {
  accountKey: string
  path: FilterPath
  applied?: string
}) {
  const router = useRouter()
  const submitted = useRef<string | undefined>(undefined)
  const migrating = applied === undefined
  useEffect(() => {
    const key = filterStorageKey(accountKey, path)
    const request = JSON.stringify([key, applied])
    if (submitted.current === request) return
    submitted.current = request
    let legacy = ""
    if (migrating) {
      try {
        legacy = normalizeRememberedHref(path, localStorage.getItem(key) ?? "")
      } catch {
        // Browsers may deny local storage access.
      }
    }
    const source = window.location.href
    void rememberFilters(accountKey, path, applied ?? legacy, migrating)
      .then(() => {
        if (submitted.current !== request) return
        try {
          localStorage.removeItem(key)
        } catch {
          // No legacy preference could be removed.
        }
      })
      .catch(() => {
        if (
          migrating &&
          submitted.current === request &&
          window.location.href === source
        ) {
          router.replace(legacy || emptyFilterHref(path), { scroll: false })
        }
      })
  }, [accountKey, applied, migrating, path, router])

  return migrating ? (
    <p role="status" className="mx-auto max-w-3xl py-4 text-sm">
      Restoring filters…
    </p>
  ) : null
}
