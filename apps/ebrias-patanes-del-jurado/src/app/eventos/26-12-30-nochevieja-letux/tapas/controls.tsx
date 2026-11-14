"use client"

import { useRouter } from "next/navigation"
import {
  type FormEvent,
  Fragment,
  type ReactNode,
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
} from "react"
import {
  notifyAction,
  useConfirmation,
} from "@/features/feedback/actions-client"
import { Confirmation, DialogActions } from "@/features/feedback/feedback"
import { submitContest } from "@/features/tapas/actions"
import { categories, type Scores, type Tapa } from "@/features/tapas/contest"
import styles from "./tapas.module.css"

export function ContestForm({
  children,
  intent,
  label,
  completed,
  confirmation,
  iconLabel,
  header,
  onSaved,
}: {
  children?: ReactNode
  intent: string
  label: string
  completed?: string
  confirmation?: string
  iconLabel?: string
  header?: { titleId: string; cancel: () => void }
  onSaved?: () => void
}) {
  const router = useRouter()
  const controls = useConfirmation()
  const [, submit, pending] = useActionState(
    async (previous: string, data: FormData) => {
      const message = await submitContest(previous, data)
      if (!message) onSaved?.()
      notifyAction(message || "Guardado.")
      if (!message && completed) router.replace(completed)
      return message
    },
    ""
  )
  return (
    <>
      <form
        className={iconLabel ? styles.entryAction : styles.form}
        action={submit}
        onSubmit={confirmation ? controls.request : undefined}
      >
        <input type="hidden" name="intent" value={intent} />
        {confirmation ? (
          <input type="hidden" name="confirm" value="yes" />
        ) : null}
        {children}
        {header ? (
          <header className="action-dialog-heading">
            <h2 id={header.titleId}>Revisa tu papeleta</h2>
            <DialogActions cancel={header.cancel} pending={pending} />
          </header>
        ) : (
          <button
            type="submit"
            disabled={pending}
            aria-label={iconLabel}
            aria-haspopup={confirmation ? "dialog" : undefined}
          >
            {iconLabel ? (
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 9v8m4-8v8" />
              </svg>
            ) : pending ? (
              "Guardando…"
            ) : (
              String(label)
            )}
          </button>
        )}
      </form>
      {confirmation ? (
        <Confirmation controls={controls} title={label}>
          {confirmation}
        </Confirmation>
      ) : null}
    </>
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
  const reviewDialog = useRef<HTMLDialogElement>(null)
  const [review, setReview] = useState<Record<string, string> | null>(null)
  const reviewBallot = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    reviewDialog.current?.showModal()
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
  const closeReview = useCallback(() => reviewDialog.current?.close(), [])
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
      <dialog
        ref={reviewDialog}
        className="action-confirmation"
        aria-labelledby={`${ballotId}-review`}
        onClose={editBallot}
      >
        {review !== null ? (
          <ContestForm
            intent="vote"
            label="Enviar papeleta"
            completed={completed}
            header={{ titleId: `${ballotId}-review`, cancel: closeReview }}
            onSaved={closeReview}
          >
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
            <input type="hidden" name="round" value={round} />
            <input type="hidden" name="generation" value={generation ?? ""} />
            {Boolean(assisted) && (
              <input type="hidden" name="assisted" value={assisted} />
            )}
            {Object.entries(review).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          </ContestForm>
        ) : null}
      </dialog>
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
  const [editing, setEditing] = useState(false)
  const toggleEdit = useCallback(() => setEditing((current) => !current), [])
  return (
    <>
      <div className={styles.entryRow}>
        <strong>{authors}</strong>
        {edit ? (
          <button
            type="button"
            aria-label={`Editar tapa de ${authors}`}
            aria-expanded={editing}
            onClick={toggleEdit}
          >
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m14 6 4 4M4 20l4-.8L20 7l-4-4L4.8 16z" />
            </svg>
          </button>
        ) : null}
        {remove}
      </div>
      {editing ? edit : null}
    </>
  )
}
