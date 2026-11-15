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
      if (message) notifyAction(message)
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
  canRandomize,
}: {
  options: Tapa[]
  round: "rubric" | "runoff"
  generation?: number
  assisted?: string
  completed?: string
  initial?: { tapa: string; scores: Scores }[]
  choice?: string
  canRandomize: boolean
}) {
  const [draftScores, setDraftScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initial ?? []).flatMap(({ tapa, scores }) =>
        categories.map(([key]) => [`score:${tapa}:${key}`, String(scores[key])])
      )
    )
  )
  const scoreDialog = useRef<HTMLDialogElement>(null)
  const [selection, setSelection] = useState<{
    fields: string[]
    title: string
  } | null>(null)
  const openScore = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const { value, dataset } = event.currentTarget
      setSelection({
        fields: value.split("\n"),
        title: dataset.title ?? "Elegir nota",
      })
      scoreDialog.current?.showModal()
    },
    []
  )
  const closeScore = useCallback(() => scoreDialog.current?.close(), [])
  const chooseScore = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!selection) return
      const value = event.currentTarget.value
      setDraftScores((current) => ({
        ...current,
        ...Object.fromEntries(selection.fields.map((field) => [field, value])),
      }))
      closeScore()
    },
    [selection, closeScore]
  )
  const ballotForm = useRef<HTMLFormElement>(null)
  const randomize = useCallback(() => {
    const form = ballotForm.current
    if (!canRandomize || !form || !options.length) return
    if (round === "runoff") {
      const choiceField = form.elements.namedItem("choice")
      if (choiceField instanceof HTMLSelectElement) {
        choiceField.value =
          options[Math.floor(Math.random() * options.length)].id
      }
      return
    }
    setDraftScores(
      Object.fromEntries(
        options.flatMap(({ id }) =>
          categories.map(([key]) => [
            `score:${id}:${key}`,
            String(Math.floor(Math.random() * 11)),
          ])
        )
      )
    )
  }, [canRandomize, options, round])
  const complete =
    round !== "rubric" ||
    options.every(({ id }) =>
      categories.every(
        ([key]) => draftScores[`score:${id}:${key}`] !== undefined
      )
    )
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
        ref={ballotForm}
        hidden={review !== null}
        onSubmit={reviewBallot}
      >
        {round === "rubric" ? (
          options.map((tapa) => (
            <fieldset key={tapa.id}>
              <legend>
                {tapa.name}{" "}
                {canRandomize ? (
                  <button
                    type="button"
                    className={styles.scoreShortcut}
                    value={categories
                      .map(([key]) => `score:${tapa.id}:${key}`)
                      .join("\n")}
                    data-title={`Todas las notas · ${tapa.name}`}
                    aria-label={`Poner la misma nota en las cuatro categorías de ${tapa.name}`}
                    aria-haspopup="dialog"
                    onClick={openScore}
                  >
                    ?
                  </button>
                ) : null}
              </legend>
              <div className={styles.rubricGrid}>
                {categories.map(([key, label]) => {
                  const field = `score:${tapa.id}:${key}`
                  return (
                    <Fragment key={key}>
                      <label htmlFor={`${ballotId}-${tapa.id}-${key}`}>
                        {label}:
                      </label>
                      <button
                        id={`${ballotId}-${tapa.id}-${key}`}
                        type="button"
                        className={styles.scoreButton}
                        value={field}
                        data-title={`${label} · ${tapa.name}`}
                        aria-label={`${label}: ${draftScores[field] ?? "sin nota"}`}
                        aria-haspopup="dialog"
                        onClick={openScore}
                      >
                        {draftScores[field] ?? "—"}
                      </button>
                      <input
                        type="hidden"
                        name={field}
                        value={draftScores[field] ?? ""}
                      />
                    </Fragment>
                  )
                })}
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
        <div className={styles.ballotActions}>
          {canRandomize && options.length > 0 ? (
            <button
              type="button"
              className={styles.secondary}
              onClick={randomize}
            >
              Rellenar al azar
            </button>
          ) : null}
          <button type="submit" disabled={!complete}>
            Revisar papeleta
          </button>
        </div>
      </form>
      <dialog
        ref={scoreDialog}
        className="action-confirmation"
        aria-labelledby={`${ballotId}-score`}
      >
        <header>
          <h2 id={`${ballotId}-score`}>{selection?.title ?? "Elegir nota"}</h2>
          <button
            type="button"
            className="action-cancel"
            aria-label="Cancelar"
            onClick={closeScore}
          >
            ×
          </button>
        </header>
        <div className={styles.scoreChoices}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <button
              key={score}
              type="button"
              value={score}
              onClick={chooseScore}
            >
              {score}
            </button>
          ))}
        </div>
      </dialog>
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
