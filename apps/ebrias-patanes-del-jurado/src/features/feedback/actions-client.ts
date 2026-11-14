import {
  type FormEvent,
  type ReactNode,
  useActionState,
  useCallback,
  useRef,
} from "react"

export function useConfirmation() {
  const dialog = useRef<HTMLDialogElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const confirmed = useRef(false)
  const request = useCallback((event: FormEvent<HTMLFormElement>) => {
    if (confirmed.current) {
      confirmed.current = false
      return
    }
    event.preventDefault()
    form.current = event.currentTarget
    dialog.current?.showModal()
  }, [])
  const cancel = useCallback(() => dialog.current?.close(), [])
  const accept = useCallback(() => {
    const target = form.current
    dialog.current?.close()
    if (!target?.reportValidity()) return
    confirmed.current = true
    try {
      target.requestSubmit()
    } finally {
      confirmed.current = false
    }
  }, [])
  return { dialog, request, cancel, accept }
}

export function notifyAction(message: ReactNode) {
  window.dispatchEvent(
    new CustomEvent("ebrias-action-feedback", { detail: message })
  )
}

export function useActionFeedback(
  action: (previous: string, form: FormData) => Promise<string>
) {
  return useActionState(async (previous: string, form: FormData) => {
    const message = await action(previous, form)
    if (message) notifyAction(message)
    return message
  }, "")
}
