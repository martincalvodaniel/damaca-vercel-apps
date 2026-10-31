interface DishNotesProps {
  notes?: string
}

export function DishNotes({ notes }: DishNotesProps) {
  if (!notes) {
    return null
  }

  return (
    <details className="mt-3 rounded-lg bg-[#f2f4ef] px-3 py-2 text-sm text-[#607067] dark:bg-white/5 dark:text-[#bdc8c0]">
      <summary className="cursor-pointer font-semibold focus:outline-none focus:ring-2 focus:ring-[#1d4f40]">
        Receta / observaciones
      </summary>
      <p className="mt-2 whitespace-pre-wrap wrap-anywhere">{notes}</p>
    </details>
  )
}
