import type { ArticleCapture } from "@/schemas/article"

const badges = {
  full: [
    "Full access",
    "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200",
  ],
  partial: [
    "Partial access",
    "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200",
  ],
  unavailable: [
    "Unavailable",
    "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  ],
} as const

export function AccessBadge({
  status,
}: {
  status: ArticleCapture["accessStatus"]
}) {
  const [label, tones] = badges[status]
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[0.6875rem] font-semibold ${tones}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
