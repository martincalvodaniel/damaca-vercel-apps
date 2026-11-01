"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState, useTransition } from "react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { clearWeeklyMealPlanAction } from "@/features/meal-planning/actions"

interface ClearWeekButtonProps {
  weekStart: string
  disabled?: boolean
}

export function ClearWeekButton({
  weekStart,
  disabled = false,
}: ClearWeekButtonProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const clearWeek = useCallback(() => {
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
  }, [weekStart, router])

  const openDialog = useCallback(() => setIsDialogOpen(true), [])

  const closeDialog = useCallback(() => setIsDialogOpen(false), [])

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={openDialog}
        disabled={disabled || isPending}
        className="inline-flex min-h-9 whitespace-nowrap items-center justify-center rounded-lg border border-border bg-field px-3 text-xs font-semibold text-danger transition hover:bg-danger-soft focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-65 sm:rounded-xl sm:px-4 sm:text-sm"
      >
        {isPending ? "Vaciando…" : "Vaciar semana"}
      </button>
      {error ? (
        <p
          className="mt-1.5 max-w-48 text-xs font-semibold text-danger"
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
        onDismiss={closeDialog}
      />
    </div>
  )
}
