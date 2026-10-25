"use client"

import { useCallback, useState } from "react"
import { hubAuthClient } from "./client"
import { safeCallback } from "./contract"

export function HubSignIn({
  appName,
  callbackUrl = "/",
  initialError = false,
}: {
  appName: string
  callbackUrl?: string
  initialError?: boolean
}) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(initialError)
  const signIn = useCallback(async () => {
    setPending(true)
    setFailed(false)
    try {
      const result = await hubAuthClient.signIn.social({
        provider: "damaca-hub",
        callbackURL: safeCallback(callbackUrl),
        errorCallbackURL: "/auth/signin?error=signin",
      })
      if (result.error) throw new Error("Sign-in failed")
    } catch {
      setFailed(true)
      setPending(false)
    }
  }, [callbackUrl])
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">{appName}</h1>
      <p>
        Inicia sesión con Google a través de Damaca Hub. Necesitas un permiso
        para esta aplicación.
      </p>
      {failed ? (
        <p role="alert">No se pudo iniciar sesión. Vuelve a intentarlo.</p>
      ) : null}
      <button
        className="min-h-11 rounded-lg border px-4 py-2 font-semibold disabled:opacity-60"
        type="button"
        disabled={pending}
        onClick={signIn}
      >
        {pending ? "Conectando…" : "Continuar con Google"}
      </button>
      <p className="text-sm">
        Se necesita conexión. Tus partidas siguen guardadas en este dispositivo.
      </p>
    </main>
  )
}
