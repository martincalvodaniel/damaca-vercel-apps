"use client"

import {
  type ChangeEvent,
  type MouseEvent,
  useActionState,
  useCallback,
  useId,
  useState,
} from "react"
import styles from "@/app/eventos/nochevieja-2026/page.module.css"
import { type PickerState, submitCostume } from "./actions"
import {
  canonicalCharacter,
  characterCatalog,
  matchesCharacter,
  normalizeCharacter,
} from "./characters"

const messages = {
  reserved: "¡El Sombrero ha hablado! Tu disfraz está reservado.",
  taken: "Ese personaje ya está reservado.",
  locked:
    "Te has pasado de listo. Contacta con el administrador para conocer tu castigo.",
  added: "Personaje añadido al catálogo. Ya puedes intentar reservarlo.",
  invalid: "Elige un personaje del catálogo o añade un nombre válido.",
  error:
    "El Sombrero se ha quedado en silencio. Recarga para comprobar tu reserva.",
  "signed-out": "Tu sesión ha caducado. Recarga e inicia sesión otra vez.",
}

export function CostumePicker({ initial }: { initial: PickerState }) {
  const [state, submit, pending] = useActionState(submitCostume, initial)
  const [query, setQuery] = useState("")
  const inputId = useId()
  const updateQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    []
  )
  const selectSuggestion = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      setQuery(event.currentTarget.value),
    []
  )
  const key = normalizeCharacter(canonicalCharacter(query.trim()))
  const names = [...characterCatalog, ...state.added]
  const exact = names.find((name) => normalizeCharacter(name) === key)
  const suggestions =
    key && !exact
      ? names.filter((name) => matchesCharacter(name, query)).slice(0, 8)
      : []
  const blocked = state.blocked

  return (
    <section className={styles.card}>
      {state.current !== null && (
        <p>
          <strong>Tu disfraz:</strong> {state.current}
        </p>
      )}
      {state.result ? <p role="status">{messages[state.result]}</p> : null}
      {blocked &&
        state.result !== "locked" &&
        state.result !== "error" &&
        state.result !== "signed-out" && <p>{messages.locked}</p>}
      {!blocked && (
        <form action={submit} className={styles.picker}>
          <label htmlFor={inputId}>Busca tu personaje</label>
          <input
            id={inputId}
            name="character"
            value={query}
            onChange={updateQuery}
            placeholder="Ej. Hermione"
            maxLength={80}
            autoComplete="off"
            required
            disabled={pending}
          />
          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  value={name}
                  onClick={selectSuggestion}
                  disabled={pending}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {exact ? (
            <button
              type="submit"
              name="intent"
              value="reserve"
              disabled={pending || exact === state.current}
            >
              {state.current ? "Cambiar disfraz" : "Reservar disfraz"}
            </button>
          ) : (
            <button
              type="submit"
              name="intent"
              value="add"
              disabled={pending || key.length < 2}
            >
              Añadir al catálogo
            </button>
          )}
        </form>
      )}
    </section>
  )
}
