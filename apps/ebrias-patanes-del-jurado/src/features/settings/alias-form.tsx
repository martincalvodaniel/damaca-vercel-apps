"use client"

import { useActionState } from "react"
import { updateAlias } from "./actions"

export function AliasForm({ alias }: { alias: string }) {
  const [message, action, pending] = useActionState(updateAlias, "")

  return (
    <form action={action} className="account admission-form">
      <label>
        Alias visible
        <input name="alias" defaultValue={alias} maxLength={80} required />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar alias"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
