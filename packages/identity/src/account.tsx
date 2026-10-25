"use client"

import { useCallback, useState } from "react"
import { hubAuthClient } from "./client"

export function HubAccount({ hubUrl }: { hubUrl: string }) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const signOut = useCallback(async () => {
    setPending(true)
    setFailed(false)
    try {
      const response = await hubAuthClient.signOut()
      if (response.error) throw new Error("Sign-out failed")
      window.location.replace("/auth/signin")
    } catch {
      setFailed(true)
      setPending(false)
    }
  }, [])
  return (
    <section className="rounded-xl border p-3">
      <h2 className="text-lg font-semibold">Cuenta y acceso</h2>
      <p className="my-2 text-sm">
        Google gestiona tu identidad en Damaca Hub. Tus partidas siguen siendo
        locales y se comparten entre las cuentas que usan este navegador.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex min-h-11 items-center underline"
          href={hubUrl}
        >
          Abrir Damaca Hub
        </a>
        <button
          className="min-h-11 rounded-lg border px-3 py-2"
          type="button"
          disabled={pending}
          onClick={signOut}
        >
          {pending ? "Cerrando…" : "Cerrar sesión en esta app"}
        </button>
      </div>
      {failed ? (
        <p role="alert">No se pudo cerrar sesión. Vuelve a intentarlo.</p>
      ) : null}
    </section>
  )
}
