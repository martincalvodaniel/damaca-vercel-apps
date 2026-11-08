"use client"

import {
  type ChangeEvent,
  type MouseEvent,
  useActionState,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react"
import styles from "@/app/eventos/26-12-30-nochevieja-letux/page.module.css"
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
  added: "¡El Sombrero ha hablado! Tu disfraz está reservado.",
  locked: "",
  invalid: "Elige un personaje del catálogo o añade un nombre válido.",
  error:
    "El Sombrero se ha quedado en silencio. Recarga para comprobar tu reserva.",
  "signed-out": "Tu sesión ha caducado. Recarga e inicia sesión otra vez.",
}

export function CostumePicker({ initial }: { initial: PickerState }) {
  const [state, submit, pending] = useActionState(submitCostume, initial)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState("")
  useEffect(() => {
    if (state.result === "reserved" && state.current !== null) {
      setSelected("")
    }
  }, [state.result, state.current])
  const inputId = useId()
  const updateQuery = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    setSelected("")
  }, [])
  const selectSuggestion = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const name = event.currentTarget.value
      setSelected(name)
    },
    []
  )
  const selectCreate = useCallback(() => setSelected("__create__"), [])
  const clearQuery = useCallback(() => {
    setQuery("")
    setSelected("")
  }, [])
  const key = normalizeCharacter(canonicalCharacter(query.trim()))
  const names = [...characterCatalog, ...state.added]
  const exact = names.find((name) => normalizeCharacter(name) === key)
  const highlighted = selected || state.current || ""
  const suggestions = key
    ? names.filter((name) => matchesCharacter(name, query)).slice(0, 8)
    : []
  const creating = Boolean(key) && !exact
  const selectedKnown = names.find(
    (name) => normalizeCharacter(name) === normalizeCharacter(selected)
  )
  const selectedValue =
    selectedKnown ??
    (selected === "__create__" && creating
      ? canonicalCharacter(query.trim())
      : "")
  return (
    <section className={styles.card}>
      {state.current !== null && (
        <p>
          <strong>Tu disfraz:</strong> {state.current}
        </p>
      )}
      <form action={submit} className={styles.picker}>
        <label htmlFor={inputId}>Busca tu personaje</label>
        <div className={styles.searchField}>
          <input
            id={inputId}
            value={query}
            onChange={updateQuery}
            placeholder="Ej. Hermione"
            maxLength={80}
            autoComplete="off"
            required
            disabled={pending}
          />
          {query.length > 0 && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={clearQuery}
              disabled={pending}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m5 5 10 10M15 5 5 15" />
              </svg>
            </button>
          )}
        </div>
        {(suggestions.length > 0 || creating) && (
          <div className={styles.suggestions}>
            {creating ? (
              <button
                type="button"
                value="__create__"
                className={
                  selected === "__create__"
                    ? styles.createSelected
                    : styles.createOption
                }
                onClick={selectCreate}
                disabled={pending}
              >
                {query.trim()} (Crear)
              </button>
            ) : null}
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                value={name}
                className={
                  normalizeCharacter(highlighted) === normalizeCharacter(name)
                    ? styles.selectedSuggestion
                    : undefined
                }
                onClick={selectSuggestion}
                disabled={pending}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <input type="hidden" name="character" value={selectedValue} />
        <input
          type="hidden"
          name="intent"
          value={selected === "__create__" ? "add-reserve" : "reserve"}
        />
        <button
          type="submit"
          disabled={
            pending ||
            state.result === "locked" ||
            !selectedValue ||
            selectedValue === state.current
          }
        >
          {state.current ? "Cambiar disfraz" : "Reservar disfraz"}
        </button>
        {state.result ? (
          <p
            className={
              state.result === "locked" ? styles.lockedMessage : undefined
            }
            role="status"
          >
            {state.result === "locked" ? (
              <>
                Qué haces?!
                <br />
                <strong>Te has pasado de list@!</strong>
                <br />
                <strong>
                  No estarás intentando averiguar que personajes están
                  reservados ya, verdad?
                </strong>
                <br />
                <strong>
                  Contacta con el administrador si realmente quieres cambiar de
                  personaje para conocer tu castigo 😈
                </strong>
              </>
            ) : (
              messages[state.result]
            )}
          </p>
        ) : null}
      </form>
    </section>
  )
}
