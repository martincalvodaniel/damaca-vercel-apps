"use client"

import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"

export function HubAccessBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [decision, setDecision] = useState("checking")
  // biome-ignore lint/correctness/useExhaustiveDependencies: Revalidate whenever client navigation changes the protected route.
  useEffect(() => {
    let disposed = false
    let generation = 0
    let activeController: AbortController | undefined
    async function check() {
      const current = ++generation
      activeController?.abort()
      const controller = new AbortController()
      activeController = controller
      const timeout = setTimeout(() => controller.abort(), 6000)
      try {
        if (!navigator.onLine) throw new Error("Offline")
        const response = await fetch("/api/access", {
          cache: "no-store",
          redirect: "error",
          signal: controller.signal,
        })
        const result: unknown = await response.json()
        const next =
          response.ok &&
          typeof result === "object" &&
          result !== null &&
          "decision" in result &&
          result.decision === "approved"
            ? "approved"
            : "blocked"
        if (!disposed && current === generation) setDecision(next)
      } catch {
        if (!disposed && current === generation) setDecision("blocked")
      } finally {
        clearTimeout(timeout)
      }
    }
    function onVisibility() {
      if (document.visibilityState === "visible") void check()
    }
    function onOffline() {
      ++generation
      activeController?.abort()
      setDecision("blocked")
    }
    void check()
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void check()
    }, 60000)
    window.addEventListener("focus", onVisibility)
    window.addEventListener("pageshow", onVisibility)
    window.addEventListener("online", onVisibility)
    window.addEventListener("offline", onOffline)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      disposed = true
      activeController?.abort()
      clearInterval(interval)
      window.removeEventListener("focus", onVisibility)
      window.removeEventListener("pageshow", onVisibility)
      window.removeEventListener("online", onVisibility)
      window.removeEventListener("offline", onOffline)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [pathname])
  if (decision !== "approved")
    return (
      <main
        className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4"
        aria-live="polite"
      >
        <h1 className="text-xl font-bold">
          {decision === "checking"
            ? "Comprobando acceso…"
            : "No se puede confirmar el acceso"}
        </h1>
        {decision === "blocked" ? (
          <>
            <p>
              Comprueba tu conexión y el permiso de esta aplicación en Damaca
              Hub. Tus partidas locales se conservan.
            </p>
            <a
              className="inline-flex min-h-11 items-center underline"
              href="/auth/access"
            >
              Revisar acceso y reintentar
            </a>
          </>
        ) : null}
      </main>
    )
  return children
}
