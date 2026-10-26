"use client"

import { useCallback, useEffect, useState } from "react"

interface HubAccessCheckProps {
  callbackUrl: string
}

export function HubAccessCheck({ callbackUrl }: HubAccessCheckProps) {
  const [state, setState] = useState<"checking" | "denied" | "unavailable">(
    "checking"
  )
  const check = useCallback(async () => {
    setState("checking")
    try {
      const response = await fetch("/api/access", {
        cache: "no-store",
        credentials: "same-origin",
        redirect: "error",
      })
      const result: unknown = await response.json()
      if (
        response.ok &&
        typeof result === "object" &&
        result !== null &&
        "decision" in result &&
        result.decision === "approved"
      ) {
        window.location.replace(callbackUrl)
        return
      }
      if (response.status === 401) {
        window.location.replace("/auth/signin")
        return
      }
      setState(response.status === 503 ? "unavailable" : "denied")
    } catch {
      setState("unavailable")
    }
  }, [callbackUrl])

  useEffect(() => {
    void check()
  }, [check])

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <section className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          {state === "checking"
            ? "Comprobando acceso…"
            : "Acceso a Dalis Tasks"}
        </h1>
        {state === "denied" ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Tu cuenta no tiene acceso a esta aplicación. Contacta con el
            administrador para solicitar acceso.
          </p>
        ) : null}
        {state === "unavailable" ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            No se pudo comprobar tu acceso. Revisa la conexión e inténtalo de
            nuevo.
          </p>
        ) : null}
        {state !== "checking" ? (
          <div className="mt-5 flex flex-col gap-3">
            <button
              className="min-h-11 rounded-lg border px-4 py-2 font-semibold"
              type="button"
              onClick={check}
            >
              Volver a comprobar
            </button>
            <a
              className="inline-flex min-h-11 items-center justify-center underline"
              href={`/auth/signin?reauthenticate=1&callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Volver a conectar con Google
            </a>
          </div>
        ) : null}
      </section>
    </main>
  )
}
