"use client"

import { createAuthClient } from "better-auth/react"
import { useCallback, useState } from "react"

const authClient = createAuthClient()

export function AccountControl({
  callbackFailed,
  callbackPath = "/",
}: {
  callbackFailed: boolean
  callbackPath?:
    | "/"
    | "/eventos/nochevieja-2026"
    | "/eventos/nochevieja-2026/disfraces"
}) {
  const session = authClient.useSession()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(callbackFailed)
  const user = session.data?.user

  const updateSession = useCallback(async () => {
    setBusy(true)
    setFailed(false)

    try {
      const result = user
        ? await authClient.signOut()
        : await authClient.signIn.social({
            provider: "google",
            callbackURL: callbackPath,
          })

      if (result.error) setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }, [callbackPath, user])

  return (
    <div className="account">
      {user ? <p className="welcome">Hola, {user.name}.</p> : null}
      <button
        type="button"
        disabled={busy || session.isPending}
        onClick={updateSession}
      >
        {session.isPending || busy
          ? "Un momento…"
          : user
            ? "Cerrar sesión"
            : "Continuar con Google"}
      </button>
      {(failed || Boolean(session.error)) && (
        <p role="alert">
          No se ha podido completar el acceso. Inténtalo de nuevo.
        </p>
      )}
    </div>
  )
}
