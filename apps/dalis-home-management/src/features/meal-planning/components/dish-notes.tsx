interface DishNotesProps {
  notes?: string
}

export function DishNotes({ notes }: DishNotesProps) {
  if (!notes) {
    return null
  }

  return (
    <details className="mt-2 rounded-lg bg-surface px-3 py-1 text-sm text-muted">
      <summary className="cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-ring">
        Receta / observaciones
      </summary>
      <p className="mt-1 whitespace-pre-wrap wrap-anywhere">{notes}</p>
    </details>
  )
}
