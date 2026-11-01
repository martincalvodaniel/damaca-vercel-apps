"use client"
import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { useStableCallback } from "@/hooks/useStableCallback"
import CloseButton from "./CloseButton"
import { ModalActionsContext } from "./modal-actions-context"

let openModalCount = 0
let previousBodyOverflow = ""

function lockPageScroll(): () => void {
  if (openModalCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
  }
  openModalCount += 1

  return () => {
    openModalCount = Math.max(0, openModalCount - 1)
    if (openModalCount === 0) {
      document.body.style.overflow = previousBodyOverflow
    }
  }
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  headerCenter?: React.ReactNode
  headerActions?: React.ReactNode
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  initialFocus?: "first" | "container"
  stableHeight?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl"
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  headerCenter,
  headerActions,
  leftAction,
  rightAction,
  initialFocus = "first",
  stableHeight = false,
  maxWidth = "md",
}: ModalProps) {
  const [actionsTarget, setActionsTarget] = useState<HTMLDivElement | null>(
    null
  )
  const startedOnBackdropRef = useRef(false)
  const handleBackdropPointerDown = useStableCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      startedOnBackdropRef.current = e.target === e.currentTarget
    }
  )
  const handleBackdropClick = useStableCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const shouldClose =
        startedOnBackdropRef.current && e.target === e.currentTarget
      startedOnBackdropRef.current = false
      if (shouldClose) {
        onClose()
      }
    }
  )
  const id = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })
  useFocusTrap(dialogRef, isOpen, initialFocus)
  useEffect(() => {
    if (!isOpen) return
    return lockPageScroll()
  }, [isOpen])
  // Browser Back button (desktop and mobile) closes the modal.
  // On open: push a sentinel history entry (same URL, state={modal:true}).
  // On Back: popstate fires → close the modal; the pointer is already at the
  //   previous entry, so no further action is needed.
  // On close by X / backdrop / Cancel: replaceState replaces the sentinel
  //   in-place — synchronous, fires NO popstate, causes NO navigation.
  //   Safe in React Strict Mode: replaceState is sync so the re-mount's
  //   pushState always sees state.modal===false and adds a fresh sentinel.
  useEffect(() => {
    if (!isOpen) return
    history.pushState({ modal: true }, "")
    const handlePopState = () => {
      onCloseRef.current()
    }
    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("popstate", handlePopState)
      if (history.state?.modal) {
        history.replaceState(null, "")
      }
    }
  }, [isOpen])
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      const modalElement = document.querySelector('[role="dialog"]')
      if (!modalElement) return
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }
    const timeoutId = setTimeout(() => {
      document.addEventListener("keydown", handleKeyDown)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])
  if (!isOpen || typeof document === "undefined") return null
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  }[maxWidth]
  const modalHeightClass = stableHeight
    ? "h-[calc(100dvh-2rem)]"
    : "max-h-[90vh]"
  const panelHeightClass = stableHeight ? "h-full" : "max-h-[90vh]"
  const modalHeader = (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2
        id={`${id}-modal-title`}
        className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-50"
      >
        {title}
      </h2>
      {headerCenter ? <div className="shrink-0">{headerCenter}</div> : null}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {headerActions}
        <div ref={setActionsTarget} className="flex items-center gap-1" />
        <CloseButton onClick={onClose} label="Cerrar diálogo" />
      </div>
    </div>
  )
  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close is a standard modal pattern
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onPointerDown={handleBackdropPointerDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className={`${maxWidthClass} ${modalHeightClass} relative w-full`}
        role="dialog"
        aria-labelledby={`${id}-modal-title`}
        aria-modal="true"
      >
        {leftAction ? (
          <div className="absolute -left-14 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
            {leftAction}
          </div>
        ) : null}

        <div
          className={`${panelHeightClass} flex w-full flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-zinc-900`}
        >
          {modalHeader}

          <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
            <ModalActionsContext value={{ target: actionsTarget }}>
              <div className="px-6 py-4">{children}</div>
            </ModalActionsContext>
          </div>
        </div>

        {rightAction ? (
          <div className="absolute -right-14 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
            {rightAction}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
