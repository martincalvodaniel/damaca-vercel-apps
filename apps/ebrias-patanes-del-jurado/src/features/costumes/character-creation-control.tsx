"use client"

import { useActionState } from "react"
import styles from "@/app/eventos/26-12-30-nochevieja-letux/page.module.css"
import { notifyAction } from "@/features/feedback/actions-client"
import { setCharacterCreation } from "./actions"

export function CharacterCreationControl({ enabled }: { enabled: boolean }) {
  const [, action, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const next = await setCharacterCreation(previous, form)
      notifyAction(next)
      return next
    },
    ""
  )
  return (
    <form action={action} className={styles.characterCreation}>
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <button
        type="submit"
        className={styles.seal}
        disabled={pending}
        aria-label={
          enabled
            ? "Desactivar creación de personajes"
            : "Activar creación de personajes"
        }
      >
        {enabled ? "Desactivar" : "Activar"}
      </button>
    </form>
  )
}
