"use client"

import { useRouter } from "next/navigation"
import { useEffect, useTransition } from "react"

export function RevealSync({ version }: { version: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const controller = new AbortController()
    let checking = false
    async function check() {
      if (document.hidden || checking || pending) return
      checking = true
      try {
        const response = await fetch("/api/tapas-reveal", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return
        const update: { version: string } = await response.json()
        if (!controller.signal.aborted && update.version !== version) {
          startTransition(() => router.refresh())
        }
      } catch {
        // Retry on the next interval.
      } finally {
        checking = false
      }
    }

    const timer = window.setInterval(check, 2000)
    document.addEventListener("visibilitychange", check)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", check)
    }
  }, [pending, router, version])

  return null
}
