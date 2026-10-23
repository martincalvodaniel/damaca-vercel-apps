"use client"

import { type FocusEvent, type KeyboardEvent, useRef } from "react"
import {
  adjustQuantity,
  getQuantityStep,
} from "@/components/ui/quantity-stepper-value"
import { quantityUnitShortLabels } from "@/config/quantity-units"
import type { QuantityUnit } from "@/schemas/quantity-unit"

interface QuantityInputStepperProps {
  id?: string
  value: string
  unit?: QuantityUnit
  minimum: number
  label: string
  disabled?: boolean
  required?: boolean
  className?: string
  fieldClassName?: string
  buttonClassName?: string
  onValueChange: (value: string) => void
  onValueCommit?: (quantity: number) => void
}

const maximumQuantity = 999_999

function parseQuantity(value: string): number | null {
  if (value.trim().length === 0) {
    return null
  }

  const quantity = Number(value)
  return Number.isFinite(quantity) ? quantity : null
}

export function QuantityInputStepper({
  id,
  value,
  unit,
  minimum,
  label,
  disabled = false,
  required = false,
  className,
  fieldClassName,
  buttonClassName,
  onValueChange,
  onValueCommit,
}: QuantityInputStepperProps) {
  const skipNextBlurCommitRef = useRef(false)
  const parsedQuantity = parseQuantity(value)
  const quantityStep = unit ? getQuantityStep(unit) : 1
  const canDecrease = parsedQuantity !== null && parsedQuantity > minimum
  const canIncrease =
    parsedQuantity === null || parsedQuantity < maximumQuantity

  function setQuantity(quantity: number, commit: boolean) {
    const boundedQuantity = Math.min(
      maximumQuantity,
      Math.max(minimum, quantity)
    )
    onValueChange(String(boundedQuantity))

    if (commit) {
      onValueCommit?.(boundedQuantity)
    }
  }

  function stepQuantity(direction: "decrease" | "increase") {
    const currentQuantity = parsedQuantity ?? minimum
    skipNextBlurCommitRef.current = true
    setQuantity(
      adjustQuantity(currentQuantity, quantityStep, direction, minimum),
      true
    )
  }

  function commitValue() {
    setQuantity(parsedQuantity ?? minimum, true)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  function handleBlur(event: FocusEvent<HTMLFieldSetElement>) {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    if (skipNextBlurCommitRef.current) {
      skipNextBlurCommitRef.current = false
      return
    }

    commitValue()
  }

  const defaultButtonClassName =
    "border-[#d0c69d] bg-white text-[#75611f] hover:bg-[#faf6e8] dark:border-white/15 dark:bg-[#10231c] dark:text-[#dccb8d] dark:hover:bg-white/5"
  const defaultFieldClassName =
    "border-[#d0d4c8] bg-white focus-within:border-[#8a7633] focus-within:ring-[#8a7633]/15 dark:border-white/15 dark:bg-[#10231c]"

  return (
    <fieldset
      className={`m-0 flex min-w-0 max-w-full items-center gap-1.5 border-0 p-0 ${className ?? ""}`}
      onBlur={handleBlur}
      aria-label={`Cantidad de ${label}`}
    >
      <button
        type="button"
        onClick={() => stepQuantity("decrease")}
        disabled={disabled || !canDecrease}
        aria-label={`Reducir cantidad de ${label}`}
        className={`grid size-9 shrink-0 place-items-center rounded-xl border text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:cursor-not-allowed disabled:opacity-35 sm:size-10 ${buttonClassName ?? defaultButtonClassName}`}
      >
        −
      </button>
      <div
        className={`flex h-9 min-w-0 flex-1 items-center rounded-xl border transition focus-within:ring-2 sm:h-10 ${fieldClassName ?? defaultFieldClassName}`}
      >
        <input
          id={id}
          type="number"
          min={minimum}
          max={maximumQuantity}
          step="any"
          required={required}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            skipNextBlurCommitRef.current = false
            onValueChange(event.currentTarget.value)
          }}
          onKeyDown={handleKeyDown}
          aria-label={`Cantidad de ${label}`}
          className="h-full w-0 min-w-0 flex-1 bg-transparent px-2 text-right text-base font-semibold text-current tabular-nums outline-none disabled:opacity-65"
        />
        {unit ? (
          <span className="shrink-0 pr-3 text-xs font-semibold opacity-75">
            {quantityUnitShortLabels[unit]}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => stepQuantity("increase")}
        disabled={disabled || !canIncrease}
        aria-label={`Aumentar cantidad de ${label}`}
        className={`grid size-9 shrink-0 place-items-center rounded-xl border text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] disabled:cursor-not-allowed disabled:opacity-35 sm:size-10 ${buttonClassName ?? defaultButtonClassName}`}
      >
        +
      </button>
    </fieldset>
  )
}
