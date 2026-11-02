import type { MouseEventHandler } from "react"
import { TaskActionIcon, type TaskActionIconName } from "./task-action-icon"
import { controlClass } from "./task-ui"

export function TaskActionButton({
  icon,
  label,
  intent,
  entryId,
  disabled,
  onClick,
  pressed,
  tone = "default",
}: {
  icon: TaskActionIconName
  label: string
  intent: string
  entryId?: string
  disabled: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
  pressed?: boolean
  tone?: "default" | "success" | "danger"
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      title={label}
      data-intent={intent}
      data-entry={entryId}
      aria-pressed={pressed}
      onClick={onClick}
      className={`${controlClass} w-8 px-0 sm:w-auto sm:px-2 ${tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : ""}`}
    >
      <TaskActionIcon name={icon} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
