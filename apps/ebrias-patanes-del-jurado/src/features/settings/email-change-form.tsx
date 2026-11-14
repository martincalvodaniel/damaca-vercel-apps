"use client"

import {
  useActionFeedback,
  useConfirmation,
} from "@/features/feedback/actions-client"
import { Confirmation } from "@/features/feedback/feedback"
import { changeMemberEmail } from "./actions"

export function EmailChangeForm({
  email,
  members,
}: {
  email: string
  members: { id: string; alias: string; email?: string }[]
}) {
  const [, action, pending] = useActionFeedback(changeMemberEmail)
  const controls = useConfirmation()
  return (
    <details>
      <summary>Cambiar correo de un miembro</summary>
      <form
        action={action}
        onSubmit={controls.request}
        className="account admission-form"
      >
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
        <input type="hidden" name="confirm" value="on" />
        <button type="submit" disabled={pending}>
          Cambiar correo
        </button>
      </form>
      <Confirmation controls={controls} title="Cambiar correo">
        Confirma que quieres cambiar el correo del miembro seleccionado a{" "}
        {email}.
      </Confirmation>
    </details>
  )
}
