"use client"

import { useActionState } from "react"
import { changeMemberEmail } from "./actions"

export function EmailChangeForm({
  email,
  members,
}: {
  email: string
  members: { id: string; alias: string; email?: string }[]
}) {
  const [message, action, pending] = useActionState(changeMemberEmail, "")
  return (
    <details>
      <summary>Cambiar correo de un miembro</summary>
      <form action={action} className="account admission-form">
        <input type="hidden" name="email" value={email} />
        <label>
          Miembro y correo anterior
          <select
            className="member-select"
            name="memberToChange"
            required
            defaultValue=""
          >
            <option value="">Selecciona un miembro</option>
            {members.map((member) =>
              member.email ? (
                <option key={member.id} value={`${member.id}|${member.email}`}>
                  {member.alias} · {member.email}
                </option>
              ) : null
            )}
          </select>
        </label>
        <label>
          <span>
            <input type="checkbox" name="confirm" required /> Confirmo el cambio
            a {email}
          </span>
        </label>
        <button type="submit" disabled={pending}>
          Cambiar correo
        </button>
        <p role="status">{message}</p>
      </form>
    </details>
  )
}
