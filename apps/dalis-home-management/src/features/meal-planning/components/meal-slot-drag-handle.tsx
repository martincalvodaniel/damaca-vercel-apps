"use client"

import type { PointerEvent } from "react"

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
  function handlePointerDown(event: PointerEvent<HTMLSpanElement>) {
    if (disabled || !event.isPrimary || event.button !== 0) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    onDragStart()
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    onDragMove(event.clientX, event.clientY)
  }

  function handlePointerUp(event: PointerEvent<HTMLSpanElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return
    }

    onDragEnd(event.clientX, event.clientY)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <span
      className={`grid size-9 touch-none select-none place-items-center rounded-lg border text-lg leading-none transition ${disabled ? "cursor-not-allowed border-[#d8ded5] opacity-45 dark:border-white/10" : "cursor-grab border-[#c9d2cb] bg-white/70 text-[#5f7167] hover:border-[#1d4f40] hover:text-[#1d4f40] active:cursor-grabbing dark:border-white/15 dark:bg-white/5 dark:text-[#bac5be]"}`}
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
