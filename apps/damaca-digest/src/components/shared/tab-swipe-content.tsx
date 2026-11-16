"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
} from "react"
import { swipeDestinations } from "@/config/navigation"

const excludedTargets =
  "button, input, select, textarea, label, summary, dialog, [contenteditable], [role=button], [role=slider]"

export function TabSwipeContent({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const tab = swipeDestinations.findIndex(({ href }) => href === pathname)
  const start = useRef<{ id: number; x: number; y: number } | null>(null)
  const suppressClick = useRef(false)

  const begin = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      start.current = null
      suppressClick.current = false
      if (
        tab < 0 ||
        event.pointerType !== "touch" ||
        !event.isPrimary ||
        event.clientX < 24 ||
        event.clientX > window.innerWidth - 24 ||
        !(event.target instanceof Element) ||
        event.target.closest(excludedTargets) ||
        document.querySelector("dialog[open]")
      )
        return

      start.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      }
    },
    [tab]
  )

  const finish = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const point = start.current
      start.current = null
      if (!point || point.id !== event.pointerId) return

      const horizontal = event.clientX - point.x
      const vertical = event.clientY - point.y
      if (
        Math.abs(horizontal) < 64 ||
        Math.abs(horizontal) < Math.abs(vertical) * 1.5
      )
        return

      suppressClick.current = true
      const destination = swipeDestinations[tab + (horizontal < 0 ? 1 : -1)]
      if (destination) router.push(destination.href)
    },
    [router, tab]
  )

  const cancel = useCallback(() => {
    start.current = null
  }, [])

  const ignoreSwipeClick = useCallback((event: MouseEvent<HTMLElement>) => {
    if (!suppressClick.current || event.detail === 0) return
    suppressClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }, [])

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: The shell renders one target for the skip link.
    <main
      id="main-content"
      tabIndex={-1}
      className={`px-3 pb-(--digest-mobile-nav) sm:px-5 md:pb-0${tab >= 0 ? " min-h-dvh touch-pan-y touch-pinch-zoom md:min-h-[calc(100dvh-var(--digest-desktop-nav))]" : ""}`}
      onPointerDown={begin}
      onPointerUp={finish}
      onPointerCancel={cancel}
      onClickCapture={ignoreSwipeClick}
    >
      {children}
    </main>
  )
}
