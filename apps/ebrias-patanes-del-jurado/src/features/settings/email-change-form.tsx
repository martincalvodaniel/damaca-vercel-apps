"use client"

import {
  useActionFeedback,
  useConfirmation,
} from "@/features/feedback/actions-client"
import { Confirmation } from "@/features/feedback/feedback"
import { PersonSelect } from "@/features/members/person-select"
import { changeMemberEmail } from "./actions"

export function EmailChangeForm({
  email,
  members,
}: {
  email: string
  members: {
    id: string
    alias: string
    email?: string
    image?: string | null
  }[]
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
        <PersonSelect
          name="memberToChange"
          required
          label="Miembro y correo anterior"
          placeholder="Selecciona un miembro"
          options={members.flatMap((member) =>
            member.email
              ? [
                  {
                    ...member,
                    value: `${member.id}|${member.email}`,
                    detail: member.email,
                  },
                ]
              : []
          )}
        />
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
