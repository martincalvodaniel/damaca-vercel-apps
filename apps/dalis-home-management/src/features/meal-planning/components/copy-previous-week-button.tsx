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
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface-raised px-3 py-2 text-right text-ink shadow-soft transition hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 ring-offset-canvas"
      >
        <span
          className="grid size-7 shrink-0 place-items-center rounded-full bg-field text-lg"
          aria-hidden="true"
        >
          ←
        </span>
        <span className="text-sm font-semibold">
          {isPending ? "Copiando…" : "Copiar semana anterior"}
        </span>
      </button>
      {error ? (
        <p className="mt-2 text-xs font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}
