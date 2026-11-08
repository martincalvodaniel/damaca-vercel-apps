"use client"

import { useActionState } from "react"
import { approveEmail } from "./actions"

export function AdmissionForm({
  members,
  request,
}: {
  members: { id: string; alias: string }[]
  request?: { email: string; name?: string }
}) {
  const [message, action, pending] = useActionState(approveEmail, "")

  return (
    <form action={action} className="account admission-form">
      {request ? (
        <>
          <strong>{request.name || request.email}</strong>
          {request.name ? <span>{request.email}</span> : null}
          <input type="hidden" name="email" value={request.email} />
        </>
      ) : (
        <label>
          Correo de Google
          <input name="email" type="email" maxLength={254} required />
        </label>
      )}
      <label>
        Miembro
        <select name="member">
          <option value="">
            {request ? "Crear miembro nuevo" : "Solo autorizar"}
          </option>
          {!request && <option value="new">Crear miembro nuevo</option>}
          {members.map(({ id, alias }) => (
            <option key={id} value={id}>
              {alias}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Guardando…" : request ? "Admitir" : "Guardar acceso"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
