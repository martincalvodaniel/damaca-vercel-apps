"use client"

import type { PointerEvent } from "react"
import { useCallback } from "react"

interface MealSlotDragHandleProps {
  dishName: string
  disabled: boolean
  onDragStart: () => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragEnd: (clientX: number, clientY: number) => void
  onDragCancel: () => void
}

export function MealSlotDragHandle({
  dishName,
  disabled,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: MealSlotDragHandleProps) {
  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (disabled || !event.isPrimary || event.button !== 0) {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      onDragStart()
    },
    [disabled, onDragStart]
  )

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return
      }

      onDragMove(event.clientX, event.clientY)
    },
    [onDragMove]
  )

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return
      }

      onDragEnd(event.clientX, event.clientY)
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    [onDragEnd]
  )

  return (
    <span
      className={`grid size-9 touch-none select-none place-items-center rounded-lg border text-lg leading-none transition ${disabled ? "cursor-not-allowed border-border opacity-45" : "cursor-grab border-border bg-field text-muted hover:border-border hover:text-primary active:cursor-grabbing"}`}
      title={`Arrastrar ${dishName}`}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={onDragCancel}
    >
      ⠿
    </span>
  )
}
