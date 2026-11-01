"use client"

import type * as React from "react"
import { type FocusEvent, type KeyboardEvent, useCallback, useRef } from "react"
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
  compact?: boolean
  className?: string
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
  compact = false,
  className,
  onValueChange,
  onValueCommit,
}: QuantityInputStepperProps) {
  const skipNextBlurCommitRef = useRef(false)
  const parsedQuantity = parseQuantity(value)
  const quantityStep = unit ? getQuantityStep(unit) : 1
  const canDecrease = parsedQuantity !== null && parsedQuantity > minimum
  const canIncrease =
    parsedQuantity === null || parsedQuantity < maximumQuantity

  const setQuantity = useCallback(
    (quantity: number, commit: boolean) => {
      const boundedQuantity = Math.min(
        maximumQuantity,
        Math.max(minimum, quantity)
      )
      onValueChange(String(boundedQuantity))

      if (commit) {
        onValueCommit?.(boundedQuantity)
      }
    },
    [minimum, onValueChange, onValueCommit]
  )

  const stepQuantity = useCallback(
    (direction: "decrease" | "increase") => {
      const currentQuantity = parsedQuantity ?? minimum
      skipNextBlurCommitRef.current = true
      setQuantity(
        adjustQuantity(currentQuantity, quantityStep, direction, minimum),
        true
      )
    },
    [parsedQuantity, minimum, setQuantity, quantityStep]
  )

  const commitValue = useCallback(() => {
    setQuantity(parsedQuantity ?? minimum, true)
  }, [setQuantity, parsedQuantity, minimum])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault()
        event.currentTarget.blur()
      }
    },
    []
  )

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLFieldSetElement>) => {
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
    },
    [commitValue]
  )

  const decreaseQuantity = useCallback(
    () => stepQuantity("decrease"),
    [stepQuantity]
  )

  const changeQuantity = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      skipNextBlurCommitRef.current = false
      onValueChange(event.currentTarget.value)
    },
    [onValueChange]
  )

  const increaseQuantity = useCallback(
    () => stepQuantity("increase"),
    [stepQuantity]
  )

  const defaultButtonClassName =
    "border-control-border bg-field text-ink hover:bg-surface-raised"
  const defaultFieldClassName =
    "border-control-border bg-field focus-within:border-ring focus-within:ring-ring"

  return (
    <fieldset
      className={`m-0 flex min-w-0 max-w-full items-center gap-1.5 border-0 text-ink p-0 ${className ?? ""}`}
      onBlur={handleBlur}
      aria-label={`Cantidad de ${label}`}
    >
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={disabled || !canDecrease}
        aria-label={`Reducir cantidad de ${label}`}
        className={`grid ${compact ? "size-8" : "size-9 sm:size-10"} shrink-0 place-items-center rounded-xl border text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-35 ${defaultButtonClassName}`}
      >
        −
      </button>
      <div
        className={`flex ${compact ? "h-8" : "h-9 sm:h-10"} min-w-0 flex-1 items-center rounded-xl border transition focus-within:ring-2 ${defaultFieldClassName}`}
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
          onChange={changeQuantity}
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
        onClick={increaseQuantity}
        disabled={disabled || !canIncrease}
        aria-label={`Aumentar cantidad de ${label}`}
        className={`grid ${compact ? "size-8" : "size-9 sm:size-10"} shrink-0 place-items-center rounded-xl border text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-35 ${defaultButtonClassName}`}
      >
        +
      </button>
    </fieldset>
  )
}
