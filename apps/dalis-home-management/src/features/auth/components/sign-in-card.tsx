"use client"

import Link from "next/link"
import { useCallback, useState, useTransition } from "react"
import { BrandMark } from "@/components/shared/brand-mark"
import { ErrorBanner } from "@/components/ui/error-banner"
import { authClient } from "@/lib/auth/auth-client"

interface SignInCardProps {
  callbackUrl: string
  initialError?: string
}

export function SignInCard({ callbackUrl, initialError }: SignInCardProps) {
  const [error, setError] = useState(initialError)
  const [isPending, startTransition] = useTransition()

  const handleSignIn = useCallback((): void => {
    setError(undefined)
    startTransition(async () => {
      try {
        const result = await authClient.signIn.social({
          provider: "google",
          callbackURL: callbackUrl,
        })

        if (result.error) {
          setError("No se ha podido conectar con Google. Inténtalo de nuevo.")
        }
      } catch {
        setError("No se ha podido conectar con Google. Inténtalo de nuevo.")
      }
    })
  }, [callbackUrl])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4 text-ink sm:p-8">
      <div
        className="absolute -left-28 -top-32 size-80 rounded-full bg-primary-soft blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-36 -right-24 size-80 rounded-full bg-accent-soft/70 blur-3xl"
        aria-hidden="true"
      />
      <section className="relative w-full max-w-md rounded-[2rem] border border-border bg-field p-6 shadow-dialog backdrop-blur sm:p-9">
        <Link
          href="/"
          aria-label="Volver al inicio de Dali"
          className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-4 ring-offset-canvas"
        >
          <BrandMark />
        </Link>

        <div className="mb-7 mt-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Acceso privado
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Inicia sesión para acceder a la gestión del hogar.
          </p>
        </div>

        {error ? <ErrorBanner>{error}</ErrorBanner> : null}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={isPending}
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ring-offset-canvas"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isPending ? "Conectando…" : "Continuar con Google"}
        </button>
      </section>
    </main>
  )
}
