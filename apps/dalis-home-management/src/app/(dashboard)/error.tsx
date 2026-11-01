"use client"

import Link from "next/link"

interface DashboardErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

export default function DashboardError({ retry }: DashboardErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-10 text-ink">
      <section className="w-full max-w-lg rounded-[2rem] border border-border bg-field p-7 text-center shadow-dialog sm:p-10">
        <div
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-danger-soft text-2xl text-danger"
          aria-hidden="true"
        >
          !
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-danger">
          Dali
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          Algo no ha salido bien
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted">
          Puede ser algo temporal. Prueba de nuevo o vuelve a nuestro espacio
          para continuar desde allí.
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-canvas"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition hover:bg-surface-raised focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Volver a la compra
          </Link>
        </div>
      </section>
    </main>
  )
}
