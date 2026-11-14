"use client"

import { useRouter } from "next/navigation"
import {
  type FormEvent,
  type ReactNode,
  useActionState,
  useCallback,
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
  assisted,
  completed,
  initial,
  choice,
}: {
  options: Tapa[]
  round: "rubric" | "runoff"
  assisted?: string
  completed?: string
  initial?: { tapa: string; scores: Scores }[]
  choice?: string
}) {
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
              <div className={styles.scores}>
                {categories.map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
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
                  </label>
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
        <section className={styles.panel} aria-label="Revisión de papeleta">
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
            {Boolean(assisted) && (
              <input type="hidden" name="assisted" value={assisted} />
            )}
            {Object.entries(review).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          </ContestForm>
          <button type="button" onClick={editBallot}>
            Editar papeleta
          </button>
        </section>
      )}
    </>
  )
}
