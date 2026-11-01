"use client"

import type { ButtonHTMLAttributes } from "react"
import { getIconButtonClass } from "./iconButton-utils"
import { CheckIcon } from "./icons/CheckIcon"

interface ConfirmActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  isPending?: boolean
  pendingLabel?: string
}

export function ConfirmAction({
  label = "Confirmar",
  isPending = false,
  pendingLabel = "Procesando…",
  disabled,
  type = "button",
  ...props
}: ConfirmActionProps) {
  const accessibleLabel = isPending ? pendingLabel : label
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isPending}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      aria-busy={isPending}
      className={getIconButtonClass("success", "sm")}
    >
      <CheckIcon />
    </button>
  )
}
