import type { ComponentPropsWithoutRef } from "react"
import { ActionIcon, type ActionIconName } from "@/components/ui/action-icon"

const tones = {
  neutral:
    "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  danger: "bg-red-700 text-white hover:bg-red-800",
  utility: "bg-blue-700 text-white hover:bg-blue-800",
}

type IconButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "aria-label" | "title"
> & {
  icon: ActionIconName
  label: string
  tone?: keyof typeof tones
}

export function IconButton({
  icon,
  label,
  tone = "neutral",
  type = "button",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-600 disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      <ActionIcon icon={icon} />
    </button>
  )
}
