"use client"

import { useEffect, useRef } from "react"

export function useDialogViewport(open: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    const viewport = window.visualViewport
    let previousHeight = viewport?.height ?? window.innerHeight
    let frame: number | undefined

    function updateViewport() {
      if (!dialog) return

      const height = viewport?.height ?? window.innerHeight
      dialog.style.setProperty("--dialog-viewport-height", `${height}px`)
      dialog.style.setProperty(
        "--dialog-viewport-top",
        `${viewport?.offsetTop ?? 0}px`
      )

      if (
        height < previousHeight &&
        window.matchMedia("(width < 40rem)").matches
      ) {
        if (frame !== undefined) cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          const activeElement = document.activeElement
          if (
            activeElement instanceof HTMLElement &&
            dialog.contains(activeElement) &&
            activeElement.matches("input, textarea, [contenteditable='true']")
          ) {
            activeElement.scrollIntoView({ block: "center", inline: "nearest" })
          }
        })
      }
      previousHeight = height
    }

    updateViewport()
    viewport?.addEventListener("resize", updateViewport)
    viewport?.addEventListener("scroll", updateViewport)
    window.addEventListener("resize", updateViewport)

    return () => {
      viewport?.removeEventListener("resize", updateViewport)
      viewport?.removeEventListener("scroll", updateViewport)
      window.removeEventListener("resize", updateViewport)
      if (frame !== undefined) cancelAnimationFrame(frame)
      dialog.style.removeProperty("--dialog-viewport-height")
      dialog.style.removeProperty("--dialog-viewport-top")
    }
  }, [open])

  return dialogRef
}
