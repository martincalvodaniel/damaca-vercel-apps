"use client"

import {
  useActionFeedback,
  useConfirmation,
} from "@/features/feedback/actions-client"
import { Confirmation } from "@/features/feedback/feedback"
import { removeMember } from "./actions"

export function RemoveMemberForm({ id, alias }: { id: string; alias: string }) {
  const [, action, pending] = useActionFeedback(removeMember)
  const controls = useConfirmation()
  return (
    <>
      <form action={action} onSubmit={controls.request}>
        <input type="hidden" name="memberId" value={id} />
        <button
          className="remove-member"
          type="submit"
          aria-label={`Eliminar a ${alias}`}
          disabled={pending}
        >
          ×
        </button>
      </form>
      <Confirmation controls={controls} title="Eliminar miembro">
        Se eliminarán definitivamente {alias} y sus datos de asistencia.
      </Confirmation>
    </>
  )
}
