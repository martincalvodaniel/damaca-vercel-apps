"use client"

import { type ReactNode, useActionState } from "react"
import { updateAlias } from "./actions"

export function AliasForm({
  alias,
  children,
}: {
  alias: string
  children: ReactNode
}) {
  const [message, action, pending] = useActionState(updateAlias, "")

  return (
    <form action={action} className="account admission-form alias-form">
      <label>
        Alias visible
        <input name="alias" defaultValue={alias} maxLength={80} required />
      </label>
      <div className="settings-actions">
        <button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar alias"}
        </button>
        {children}
      </div>
      <p role="status">{message}</p>
    </form>
  )
}
