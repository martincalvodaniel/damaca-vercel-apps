"use client"

import { useRouter } from "next/navigation"
import {
  type FormEvent,
  Fragment,
  type ReactNode,
  useActionState,
  useCallback,
  useId,
  useState,
} from "react"
import { submitContest } from "@/features/tapas/actions"
import { categories, type Scores, type Tapa } from "@/features/tapas/contest"
import styles from "./tapas.module.css"

export function ContestForm({
  children,
  intent,
  label,
  completed,
}: {
  children?: ReactNode
  intent: string
  label: string
  completed?: string
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [error, submit, pending] = useActionState(
    async (previous: string, data: FormData) => {
      setSaved(false)
      const message = await submitContest(previous, data)
      if (!message) {
        setSaved(true)
        if (completed) router.replace(completed)
      }
      return message
    },
    ""
  )
  return (
    <form className={styles.form} action={submit}>
      <input type="hidden" name="intent" value={intent} />
      {children}
      <button type="submit" disabled={pending}>
        {pending ? "Guardando…" : String(label)}
      </button>
      {error ? (
        <p role="alert">{error}</p>
      ) : saved ? (
        <p role="status">Guardado.</p>
      ) : null}
    </form>
  )
}

export function Ballot({
  options,
  round,
  generation,
  assisted,
  completed,
  initial,
  choice,
}: {
  options: Tapa[]
  round: "rubric" | "runoff"
  generation?: number
  assisted?: string
  completed?: string
  initial?: { tapa: string; scores: Scores }[]
  choice?: string
}) {
  const ballotId = useId()
  const [review, setReview] = useState<Record<string, string> | null>(null)
  const reviewBallot = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setReview(
      Object.fromEntries(
        Array.from(new FormData(event.currentTarget), ([key, value]) => [
          key,
          String(value),
        ])
      )
    )
  }, [])
  const editBallot = useCallback(() => setReview(null), [])
  return (
    <>
      <form
        className={styles.form}
        hidden={review !== null}
        onSubmit={reviewBallot}
      >
        {round === "rubric" ? (
          options.map((tapa) => (
            <fieldset key={tapa.id}>
              <legend>{tapa.name}</legend>
              <div className={styles.rubricGrid}>
                {categories.map(([key, label]) => (
                  <Fragment key={key}>
                    <label htmlFor={`${ballotId}-${tapa.id}-${key}`}>
                      {label}:
                    </label>
                    <input
                      id={`${ballotId}-${tapa.id}-${key}`}
                      type="number"
                      inputMode="numeric"
                      name={`score:${tapa.id}:${key}`}
                      required
                      min={0}
                      max={10}
                      step={1}
                      defaultValue={
                        initial?.find(({ tapa: id }) => id === tapa.id)?.scores[
                          key
                        ]
                      }
                    />
                  </Fragment>
                ))}
              </div>
            </fieldset>
          ))
        ) : (
          <label>
            Tapa favorita
            <select name="choice" required defaultValue={choice ?? ""}>
              <option value="" disabled>
                Elige una tapa
              </option>
              {options.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit">Revisar papeleta</button>
      </form>
      {review !== null && (
        <section aria-label="Revisión de papeleta">
          <h2>Revisa tu papeleta</h2>
          {round === "rubric" ? (
            options.map(({ id, name }) => (
              <div key={id}>
                <strong>{name}</strong>
                <ul>
                  {categories.map(([key, label]) => (
                    <li key={key}>
                      {label}: {review[`score:${id}:${key}`]}/10
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>{options.find(({ id }) => id === review.choice)?.name}</p>
          )}
          <ContestForm
            intent="vote"
            label="Enviar papeleta"
            completed={completed}
          >
            <input type="hidden" name="round" value={round} />
            <input type="hidden" name="generation" value={generation ?? ""} />
            {Boolean(assisted) && (
              <input type="hidden" name="assisted" value={assisted} />
            )}
            {Object.entries(review).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          </ContestForm>
          <button
            type="button"
            className={styles.secondary}
            onClick={editBallot}
          >
            Editar papeleta
          </button>
        </section>
      )}
    </>
  )
}

export function EntryControls({
  authors,
  edit,
  remove,
}: {
  authors: string
  edit?: ReactNode
  remove?: ReactNode
}) {
  const [panel, setPanel] = useState<"edit" | "remove" | null>(null)
  const toggleEdit = useCallback(
    () => setPanel((current) => (current === "edit" ? null : "edit")),
    []
  )
  const toggleRemove = useCallback(
    () => setPanel((current) => (current === "remove" ? null : "remove")),
    []
  )
  return (
    <>
      <div className={styles.entryRow}>
        <strong>{authors}</strong>
        {edit ? (
          <button
            type="button"
            aria-label={`Editar tapa de ${authors}`}
            aria-expanded={panel === "edit"}
            onClick={toggleEdit}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m14 6 4 4M4 20l4-.8L20 7l-4-4L4.8 16z" />
            </svg>
          </button>
        ) : null}
        {remove ? (
          <button
            type="button"
            aria-label={`Borrar tapa de ${authors}`}
            aria-expanded={panel === "remove"}
            onClick={toggleRemove}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 9v8m4-8v8" />
            </svg>
          </button>
        ) : null}
      </div>
      {panel === "edit" ? edit : panel === "remove" ? remove : null}
    </>
  )
}
