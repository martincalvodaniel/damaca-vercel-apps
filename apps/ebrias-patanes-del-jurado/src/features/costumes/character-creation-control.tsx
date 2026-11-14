"use client"

import { useActionState, useCallback, useState } from "react"
import styles from "@/app/eventos/26-12-30-nochevieja-letux/page.module.css"
import { setCharacterCreation } from "./actions"

export function CharacterCreationControl({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [message, action, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const next = await setCharacterCreation(previous, form)
      setOpen(true)
      return next
    },
    ""
  )
  const dismiss = useCallback(() => setOpen(false), [])
  const visible = open && Boolean(message)
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
      <div className={styles.creationNotice} hidden={!visible}>
        <p>{message}</p>
        <button type="button" className={styles.seal} onClick={dismiss}>
          Cerrar
        </button>
      </div>
      <span className={styles.creationAnnouncement} role="status">
        {visible ? message : ""}
      </span>
    </form>
  )
}
