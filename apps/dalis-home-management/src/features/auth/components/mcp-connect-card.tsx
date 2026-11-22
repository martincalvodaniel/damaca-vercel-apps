"use client"

import { oauthProviderClient } from "@better-auth/oauth-provider/client"
import { createAuthClient } from "better-auth/react"
import { useCallback, useState } from "react"
import { BrandMark } from "@/components/shared/brand-mark"
import { ErrorBanner } from "@/components/ui/error-banner"
import { mcpAuthPath } from "@/lib/auth/mcp-paths"

const client = createAuthClient({
  basePath: mcpAuthPath,
  plugins: [oauthProviderClient()],
})

export function McpConnectCard({
  step,
}: {
  step: "sign-in" | "consent" | "unavailable"
}) {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  const submit = useCallback(
    async (accept: boolean) => {
      setPending(true)
      setFailed(false)
      try {
        const result =
          step === "sign-in"
            ? await client.signIn.social({
                provider: "google",
                callbackURL: "/",
                disableRedirect: true,
              })
            : await client.oauth2.consent({ accept })
        if (result.error || !result.data?.url)
          throw new Error("Connection failed")
        window.location.assign(result.data.url)
      } catch {
        setPending(false)
        setFailed(true)
      }
    },
    [step]
  )
  const allow = useCallback(() => submit(true), [submit])
  const deny = useCallback(() => submit(false), [submit])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas p-3 text-ink sm:p-6">
      <section className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-field p-4 sm:p-6">
        <BrandMark />
        <h1 className="text-xl font-semibold">Conectar Dalis Home</h1>
        <p className="text-sm text-muted">
          {step === "unavailable"
            ? "Vuelve a iniciar la conexión desde tu asistente con una cuenta autorizada."
            : "El asistente podrá consultar la comida y la cena del menú compartido."}
        </p>
        {failed ? (
          <ErrorBanner>
            No se ha podido conectar. Reinicia la conexión desde tu asistente.
          </ErrorBanner>
        ) : null}
        {step !== "unavailable" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={allow}
              className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
            >
              {pending
                ? "Conectando…"
                : step === "sign-in"
                  ? "Continuar con Google"
                  : "Permitir"}
            </button>
            {step === "consent" ? (
              <button
                type="button"
                disabled={pending}
                onClick={deny}
                className="min-h-11 rounded-full border border-control-border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60"
              >
                Denegar
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  )
}
