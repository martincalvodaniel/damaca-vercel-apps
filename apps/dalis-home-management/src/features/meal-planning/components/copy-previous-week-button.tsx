"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
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

  const copyPreviousWeek = useCallback(() => {
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
  }, [weekStart, router])

  return (
    <>
      <button
        type="button"
        onClick={copyPreviousWeek}
        disabled={isPending}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-[#d8d7bd] bg-[#eeeddc] px-3 py-2 text-right text-[#303b2d] shadow-[0_18px_50px_rgba(50,72,60,0.08)] transition hover:bg-[#e8e7d3] focus:outline-none focus:ring-2 focus:ring-[#74794f] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 dark:border-[#59624e] dark:bg-[#2e382b] dark:text-[#f4f3e7] dark:hover:bg-[#374333] dark:ring-offset-[#10221c]"
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-white/60 text-lg dark:bg-white/10"
          aria-hidden="true"
        >
          ←
        </span>
        <span className="text-sm font-semibold">
          {isPending ? "Copiando…" : "Copiar semana anterior"}
        </span>
      </button>
      {error ? (
        <p
          className="mt-2 text-xs font-semibold text-[#a34435] dark:text-[#ffb4a4]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </>
  )
}
