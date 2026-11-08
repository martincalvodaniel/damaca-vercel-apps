"use client"

import { useActionState, useId } from "react"
import { approveEmail } from "./actions"

export function AdmissionForm() {
  const emailId = useId()
  const [message, action, pending] = useActionState(approveEmail, "")

  return (
    <form action={action} className="account admission-form">
      <label htmlFor={emailId}>Correo de Google</label>
      <input id={emailId} name="email" type="email" maxLength={254} required />
      <button type="submit" disabled={pending}>
        {pending ? "Autorizando…" : "Autorizar"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
