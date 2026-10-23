"use client"

import Link from "next/link"

interface DashboardErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

export default function DashboardError({ retry }: DashboardErrorProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f4ee] px-4 py-10 text-[#17352b] dark:bg-[#10221c] dark:text-[#f4f1e7]">
      <section className="w-full max-w-lg rounded-[2rem] border border-[#e3d1c7] bg-white/75 p-7 text-center shadow-[0_24px_70px_rgba(50,72,60,0.1)] sm:p-10 dark:border-white/10 dark:bg-[#182e26]/90">
        <div
          className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5dfd2] text-2xl text-[#9a4d39] dark:bg-[#4b3027] dark:text-[#f2b7a5]"
          aria-hidden="true"
        >
          !
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#c36d49]">
          Dali
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          Algo no ha salido bien
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#63736a] dark:text-[#b4c0b8]">
          Puede ser algo temporal. Prueba de nuevo o vuelve a nuestro espacio
          para continuar desde allí.
        </p>

        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#1d4f40] px-6 text-sm font-semibold text-white transition hover:bg-[#173f34] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2 dark:ring-offset-[#182e26]"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#ccd5ce] px-6 text-sm font-semibold transition hover:bg-[#edf0e9] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] dark:border-white/15 dark:hover:bg-white/10"
          >
            Volver a la compra
          </Link>
        </div>
      </section>
    </main>
  )
}
