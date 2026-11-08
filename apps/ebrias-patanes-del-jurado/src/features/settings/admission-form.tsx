"use client"

import { useActionState } from "react"
import { approveEmail, deleteAdmissionRequest } from "./actions"

export function AdmissionForm({
  members,
  request,
}: {
  members: { id: string; alias: string }[]
  request?: { email: string; name?: string }
}) {
  const [message, action, pending] = useActionState(approveEmail, "")

  const [deleteMessage, deleteAction, deleting] = useActionState(
    deleteAdmissionRequest,
    ""
  )

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
        <select className="member-select" name="member">
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
      <div className="settings-actions">
        <button type="submit" disabled={pending || deleting}>
          {pending ? "Guardando…" : request ? "Admitir" : "Guardar acceso"}
        </button>
        {request ? (
          <button
            type="submit"
            formAction={deleteAction}
            className="delete-request"
            disabled={pending || deleting}
          >
            Eliminar
          </button>
        ) : null}
      </div>
      <p role="status">{deleteMessage || message}</p>
    </form>
  )
}
