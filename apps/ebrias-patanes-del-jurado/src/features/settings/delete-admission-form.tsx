"use client"

import { useActionState } from "react"
import { deleteAdmissionRequest } from "./actions"

export function DeleteAdmissionForm({ email }: { email: string }) {
  const [message, action, pending] = useActionState(deleteAdmissionRequest, "")

  return (
    <form action={action} className="account request-delete-form">
      <input type="hidden" name="email" value={email} />
      <button type="submit" disabled={pending}>
        {pending ? "Eliminando…" : "Eliminar solicitud"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
