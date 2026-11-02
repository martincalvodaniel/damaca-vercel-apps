"use client"

import { type PointerEvent, useCallback, useRef, useState } from "react"
import type {
  HouseholdTask,
  HouseholdTaskOccurrence,
} from "@/types/household-task"

export interface TaskDragPayload {
  task: HouseholdTask
  occurrence?: HouseholdTaskOccurrence
}

function targetDate(x: number, y: number) {
  return (
    document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-household-drop-date]")?.dataset
      .householdDropDate ?? null
  )
}

export function TaskDragHandle({
  payload,
  disabled,
  onDrop,
  onHover,
}: {
  payload: TaskDragPayload
  disabled: boolean
  onDrop: (payload: TaskDragPayload, date: string) => void
  onHover: (date: string | null) => void
}) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const reset = useCallback(() => {
    start.current = null
    setDragging(false)
    onHover(null)
  }, [onHover])
  const handleDown = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (disabled || !event.isPrimary || event.button !== 0) return
      event.currentTarget.setPointerCapture(event.pointerId)
      start.current = { x: event.clientX, y: event.clientY }
    },
    [disabled]
  )
  const handleMove = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      if (!start.current) return
      if (
        Math.hypot(
          event.clientX - start.current.x,
          event.clientY - start.current.y
        ) < 6
      )
        return
      setDragging(true)
      onHover(targetDate(event.clientX, event.clientY))
      if (event.clientY < 100) window.scrollBy(0, -14)
      if (event.clientY > window.innerHeight - 100) window.scrollBy(0, 14)
    },
    [onHover]
  )
  const handleUp = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      const moved =
        start.current &&
        Math.hypot(
          event.clientX - start.current.x,
          event.clientY - start.current.y
        ) >= 6
      const date = moved ? targetDate(event.clientX, event.clientY) : null
      reset()
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
      if (date) onDrop(payload, date)
    },
    [reset, onDrop, payload]
  )
  return (
    <span
      aria-hidden="true"
      title={`Arrastrar ${payload.task.name}`}
      className={`grid size-8 shrink-0 touch-none select-none place-items-center rounded-full border border-control-border bg-field text-base text-muted ${disabled ? "opacity-50" : dragging ? "cursor-grabbing ring-2 ring-ring" : "cursor-grab"}`}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={reset}
      onLostPointerCapture={reset}
    >
      ⠿
    </span>
  )
}
