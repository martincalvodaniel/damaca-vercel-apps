"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { copyPreviousWeekAction } from "@/features/meal-planning/actions"

interface CopyPreviousWeekButtonProps {
  weekStart: string
}

export function CopyPreviousWeekButton({
  weekStart,
}: CopyPreviousWeekButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function copyPreviousWeek() {
    setError(null)

    startTransition(async () => {
      try {
        const result = await copyPreviousWeekAction(weekStart)
        if (!result.success) {
          setError(result.message)
          return
        }

        router.refresh()
      } catch {
        setError("No se ha podido copiar el menú. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <div className="rounded-2xl border border-dashed border-[#bdc8bf] bg-white/55 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 dark:border-white/15 dark:bg-white/5">
      <div>
        <p className="text-sm font-semibold">¿Repetimos la semana?</p>
        <p className="mt-1 text-xs leading-5 text-[#63736a] dark:text-[#b4c0b8]">
          Copia las comidas y cenas anteriores para ajustarlas desde aquí.
        </p>
        {error ? (
          <p
            className="mt-2 text-xs font-semibold text-[#a34435] dark:text-[#ffb4a4]"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={copyPreviousWeek}
        disabled={isPending}
        className="mt-4 inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl border border-[#8aa091] bg-white px-4 text-sm font-semibold text-[#31523f] transition hover:bg-[#edf2ed] focus:outline-none focus:ring-2 focus:ring-[#1d4f40] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 sm:mt-0 sm:w-auto dark:border-[#637e69] dark:bg-white/5 dark:text-[#d7e7da] dark:hover:bg-white/10 dark:ring-offset-[#10221c]"
      >
        {isPending ? "Copiando…" : "Copiar semana anterior"}
      </button>
    </div>
  )
}
