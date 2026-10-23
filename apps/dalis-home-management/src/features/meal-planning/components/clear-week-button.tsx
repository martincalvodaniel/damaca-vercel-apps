"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { clearWeeklyMealPlanAction } from "@/features/meal-planning/actions"

interface ClearWeekButtonProps {
  weekStart: string
}

export function ClearWeekButton({ weekStart }: ClearWeekButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function clearWeek() {
    setIsDialogOpen(false)
    setError(null)
    startTransition(async () => {
      try {
        const result = await clearWeeklyMealPlanAction(weekStart)
        if (!result.success) {
          setError(result.message)
          return
        }

        router.refresh()
      } catch {
        setError("No se ha podido vaciar la semana. Inténtalo de nuevo.")
      }
    })
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#d8b8ad] bg-white/70 px-3 text-xs font-semibold text-[#9a4d39] transition hover:bg-[#fff3ef] focus:outline-none focus:ring-2 focus:ring-[#a75938] disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:rounded-xl sm:px-4 sm:text-sm dark:border-[#754c40] dark:bg-white/5 dark:text-[#f2b7a5] dark:hover:bg-[#4b3027]"
      >
        {isPending ? "Vaciando…" : "Vaciar semana"}
      </button>
      {error ? (
        <p
          className="mt-1.5 max-w-48 text-xs font-semibold text-[#a34435] dark:text-[#ffb4a4]"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <ConfirmationDialog
        open={isDialogOpen}
        title="Vaciar esta semana"
        description="Se quitarán todas las comidas y cenas planificadas para esta semana."
        confirmLabel="Vaciar semana"
        tone="danger"
        onConfirm={clearWeek}
        onDismiss={() => setIsDialogOpen(false)}
      />
    </div>
  )
}
