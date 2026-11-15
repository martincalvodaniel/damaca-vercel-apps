"use client"

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { notifyAction, type useConfirmation } from "./actions-client"

export function Confirmation({
  controls,
  title,
  children,
}: {
  controls: ReturnType<typeof useConfirmation>
  title: string
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <dialog
      ref={controls.dialog}
      className="action-confirmation"
      aria-labelledby={titleId}
    >
      <header>
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="action-cancel"
          aria-label="Cancelar"
          onClick={controls.cancel}
        >
          ×
        </button>
        <button
          type="button"
          className="action-accept"
          aria-label="Confirmar"
          onClick={controls.accept}
        >
          ✓
        </button>
      </header>
      <div className="action-confirmation-copy">{children}</div>
    </dialog>
  )
}

export function ActionFeedback({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (children) notifyAction(children)
  }, [children])
  return null
}

export function ActionPopup() {
  const [message, setMessage] = useState<ReactNode>(null)
  const popup = useRef<HTMLDivElement>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dismiss = useCallback(() => {
    clearTimeout(timeout.current)
    popup.current?.hidePopover()
    setMessage(null)
  }, [])
  useEffect(() => {
    function onFeedback(event: Event) {
      setMessage((event as CustomEvent<ReactNode>).detail)
      popup.current?.showPopover()
      clearTimeout(timeout.current)
      timeout.current = setTimeout(dismiss, 5000)
    }
    window.addEventListener("ebrias-action-feedback", onFeedback)
    return () => {
      clearTimeout(timeout.current)
      window.removeEventListener("ebrias-action-feedback", onFeedback)
    }
  }, [dismiss])
  return (
    <div ref={popup} popover="manual" className="action-popup">
      <div role="status">{message}</div>
      <button
        type="button"
        className="action-cancel"
        aria-label="Cerrar aviso"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  )
}

export function DialogActions({
  formId,
  cancel,
  pending,
}: {
  formId?: string
  cancel: () => void
  pending: boolean
}) {
  return (
    <>
      <button
        type="button"
        className="action-cancel"
        aria-label="Cancelar"
        onClick={cancel}
      >
        ×
      </button>
      <button
        type="submit"
        form={formId}
        className="action-accept"
        aria-label="Confirmar"
        disabled={pending}
      >
        ✓
      </button>
    </>
  )
}
