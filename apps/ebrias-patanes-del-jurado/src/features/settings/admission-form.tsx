"use client"

import { useActionFeedback } from "@/features/feedback/actions-client"
import { PersonSelect } from "@/features/members/person-select"
import { approveEmail, deleteAdmissionRequest } from "./actions"

export function AdmissionForm({
  members,
  request,
}: {
  members: { id: string; alias: string; image?: string | null }[]
  request?: { email: string; name?: string }
}) {
  const [, action, pending] = useActionFeedback(approveEmail)

  const [, deleteAction, deleting] = useActionFeedback(deleteAdmissionRequest)

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
      <PersonSelect
        name="member"
        label="Miembro"
        options={members}
        placeholder={request ? "Crear miembro nuevo" : "Solo autorizar"}
        extra={
          request ? undefined : { value: "new", label: "Crear miembro nuevo" }
        }
      />
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
    </form>
  )
}
