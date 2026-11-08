"use client"

import { type FormEvent, useActionState, useCallback } from "react"
import { removeMember } from "./actions"

export function RemoveMemberForm({ id, alias }: { id: string; alias: string }) {
  const [message, action, pending] = useActionState(removeMember, "")
  const confirmRemoval = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      if (
        !window.confirm(
          `¿Eliminar definitivamente a ${alias} y sus datos de asistencia?`
        )
      ) {
        event.preventDefault()
      }
    },
    [alias]
  )
  return (
    <form action={action} onSubmit={confirmRemoval}>
      <input type="hidden" name="memberId" value={id} />
      <button
        className="remove-member"
        type="submit"
        aria-label={`Eliminar a ${alias}`}
        disabled={pending}
      >
        ×
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  )
}
