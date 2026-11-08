"use client"

import { useEffect, useState } from "react"

export function AdmissionAlert() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    async function refresh() {
      if (document.hidden) return
      try {
        const response = await fetch("/api/admission-count", {
          signal: controller.signal,
        })
        if (response.ok) {
          const result: { count: number } = await response.json()
          setCount(result.count)
        }
      } catch {
        // Keep the previous count until the next refresh.
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, 15000)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [])

  return (
    <span aria-live="polite">
      {count > 0 ? `${count} pendiente${count === 1 ? "" : "s"}` : null}
    </span>
  )
}
