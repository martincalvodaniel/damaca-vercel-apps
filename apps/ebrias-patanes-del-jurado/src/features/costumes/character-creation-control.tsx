"use client"

import { useActionState } from "react"
import { setCharacterCreation } from "./actions"

export function CharacterCreationControl({ enabled }: { enabled: boolean }) {
  const [message, action, pending] = useActionState(setCharacterCreation, "")
  return (
    <form action={action}>
      <input type="hidden" name="enabled" value={String(!enabled)} />
      <button type="submit" disabled={pending}>
        {enabled
          ? "Deshabilitar creación de personajes"
          : "Habilitar creación de personajes"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
