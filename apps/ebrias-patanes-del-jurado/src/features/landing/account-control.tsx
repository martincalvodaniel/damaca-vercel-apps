"use client"

import { createAuthClient } from "better-auth/react"
import { useCallback, useState } from "react"

const authClient = createAuthClient()

export function AccountControl({
  callbackFailed = false,
  admissionRequired = false,
  signedIn = false,
}: {
  callbackFailed?: boolean
  admissionRequired?: boolean
  signedIn?: boolean
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(
    admissionRequired
      ? "Tu solicitud está pendiente. Podrás entrar cuando un administrador autorice tu correo."
      : callbackFailed
        ? "No se ha podido completar el acceso. Inténtalo de nuevo."
        : null
  )

  const updateSession = useCallback(async () => {
    setBusy(true)
    setError(null)

    try {
      const result = signedIn
        ? await authClient.signOut()
        : await authClient.signIn.social({
            provider: "google",
            callbackURL: "/",
          })

      if (result.error) throw result.error
      if (signedIn) window.location.assign("/")
    } catch {
      setError("No se ha podido completar la operación. Inténtalo de nuevo.")
    } finally {
      setBusy(false)
    }
  }, [signedIn])

  return (
    <div className="account">
      <button type="button" disabled={busy} onClick={updateSession}>
        {busy
          ? "Un momento…"
          : signedIn
            ? "Cerrar sesión"
            : "Continuar con Google"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  )
}
