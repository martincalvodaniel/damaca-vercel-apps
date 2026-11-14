"use client"

import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
  useCallback,
  useId,
  useState,
  useTransition,
} from "react"
import { saveGuide } from "@/features/event-guide/actions"
import {
  type EventGuide,
  type GuideBlock,
  type GuideSection,
  guideEntries,
  guideLimits,
  guideSections,
  isActivityDay,
} from "@/features/event-guide/guide"
import styles from "./guide.module.css"
import eventStyles from "./page.module.css"

type GuideVersion = { guide: EventGuide; revision: number }

export function GuideEditor({ guide, revision }: GuideVersion) {
  const [editing, setEditing] = useState(false)

  const open = useCallback(() => {
    setEditing(true)
  }, [])
  const close = useCallback(() => {
    setEditing(false)
  }, [])

  return editing ? (
    <GuideForm guide={guide} revision={revision} close={close} />
  ) : (
    <button className={styles.primary} type="button" onClick={open}>
      Editar guía
    </button>
  )
}

function GuideForm({
  guide,
  revision,
  close,
}: GuideVersion & { close: () => void }) {
  const [draft, setDraft] = useState(guide)
  const [baseRevision] = useState(revision)
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const submit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      setMessage("")
      startTransition(async () => {
        try {
          const error = await saveGuide(baseRevision, draft)
          if (error) setMessage(error)
          else close()
        } catch {
          setMessage("No se pudo guardar la guía. Puedes volver a intentarlo.")
        }
      })
    },
    [baseRevision, close, draft]
  )

  const editNote = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget
    setDraft((current) => ({
      ...current,
      notes: { ...current.notes, [name]: value },
    }))
  }, [])

  return (
    <form aria-label="Editar guía" className={styles.panel} onSubmit={submit}>
      <fieldset className={styles.fields} disabled={pending}>
        <legend>Editar guía</legend>
        <label>
          Alojamiento
          <textarea
            rows={2}
            maxLength={guideLimits.text}
            value={draft.notes.lodging}
            name="lodging"
            onChange={editNote}
          />
        </label>
        {guideSections.map(({ id, label }) => (
          <GuideSectionFields
            key={id}
            label={label}
            section={id}
            draft={draft}
            setDraft={setDraft}
            editNote={editNote}
          />
        ))}
        <div className={styles.controls}>
          <button className={eventStyles.seal} type="submit">
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
          <button type="button" onClick={close}>
            Cancelar
          </button>
        </div>
      </fieldset>
      {message ? <p role="alert">{message}</p> : null}
    </form>
  )
}

function GuideSectionFields({
  label,
  draft,
  section,
  setDraft,
  editNote,
}: {
  label: string
  draft: EventGuide
  section: GuideSection
  setDraft: Dispatch<SetStateAction<EventGuide>>
  editNote: (event: ChangeEvent<HTMLTextAreaElement>) => void
}) {
  const blocks = draft.sections[section]
  const entries = guideEntries(draft, section)

  const setEntries = useCallback(
    (
      update: (
        entries: ReturnType<typeof guideEntries>
      ) => ReturnType<typeof guideEntries>
    ) => {
      setDraft((current) => {
        const next = update(guideEntries(current, section))
        const activityPositions = {
          dec30: current.activityPositions?.dec30 ?? 0,
          dec31:
            current.activityPositions?.dec31 ?? current.sections.dec31.length,
        }
        if (isActivityDay(section)) {
          activityPositions[section] = next.findIndex(
            (entry) => "link" in entry
          )
        }
        return {
          ...current,
          activityPositions,
          sections: {
            ...current.sections,
            [section]: next.filter((entry) => "text" in entry),
          },
        }
      })
    },
    [section, setDraft]
  )

  const addBlock = useCallback(() => {
    const block = { id: crypto.randomUUID(), title: "", text: "" }
    setEntries((current) => [...current, block])
  }, [setEntries])

  const removeBlock = useCallback(
    (blockId: string) => {
      setEntries((current) => current.filter(({ id }) => id !== blockId))
    },
    [setEntries]
  )

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      setEntries((current) => {
        const index = current.findIndex((entry) => entry.id === id)
        const target = index + direction
        const entry = current[index]
        if (!entry || target < 0 || target >= current.length) return current
        const next = [...current]
        next.splice(index, 1)
        next.splice(target, 0, entry)
        return next
      })
    },
    [setEntries]
  )

  const editBlock = useCallback(
    (id: string, field: "title" | "text", value: string) => {
      setEntries((current) =>
        current.map((block) =>
          block.id === id ? { ...block, [field]: value } : block
        )
      )
    },
    [setEntries]
  )

  return (
    <fieldset className={styles.fields}>
      <legend>{label}</legend>
      {entries.map((block, index) =>
        "link" in block ? (
          <fieldset className={styles.blockFields} key={block.id}>
            <legend>{block.title}</legend>
            <label>
              Nota
              <textarea
                rows={2}
                maxLength={guideLimits.text}
                value={draft.notes[block.id]}
                name={block.id}
                onChange={editNote}
              />
            </label>
          </fieldset>
        ) : (
          <GuideBlockFields
            key={block.id}
            block={block}
            index={index}
            last={index === entries.length - 1}
            moveBlock={moveBlock}
            editBlock={editBlock}
            removeBlock={removeBlock}
          />
        )
      )}
      <button
        type="button"
        disabled={blocks.length >= guideLimits.blocks}
        onClick={addBlock}
      >
        Añadir bloque
      </button>
    </fieldset>
  )
}

function GuideBlockFields({
  block,
  index,
  last,
  editBlock,
  moveBlock,
  removeBlock,
}: {
  block: GuideBlock
  index: number
  last: boolean
  editBlock: (id: string, field: "title" | "text", value: string) => void
  moveBlock: (id: string, direction: -1 | 1) => void
  removeBlock: (id: string) => void
}) {
  const heading = useId()
  const editTitle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      editBlock(block.id, "title", event.currentTarget.value)
    },
    [block.id, editBlock]
  )

  const editText = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      editBlock(block.id, "text", event.currentTarget.value)
    },
    [block.id, editBlock]
  )

  const moveUp = useCallback(() => {
    moveBlock(block.id, -1)
  }, [block.id, moveBlock])
  const moveDown = useCallback(() => {
    moveBlock(block.id, 1)
  }, [block.id, moveBlock])
  const remove = useCallback(() => {
    removeBlock(block.id)
  }, [block.id, removeBlock])

  return (
    <fieldset className={styles.blockFields} aria-labelledby={heading}>
      <div className={styles.blockHeading}>
        <span id={heading}>Bloque {index + 1}</span>
        <div className={styles.blockButtons}>
          <BlockButton
            label="Subir"
            path="m6 15 6-6 6 6"
            disabled={index === 0}
            onClick={moveUp}
          />
          <BlockButton
            label="Bajar"
            path="m6 9 6 6 6-6"
            disabled={last}
            onClick={moveDown}
          />
          <BlockButton
            label="Eliminar"
            path="m6 6 12 12M18 6 6 18"
            onClick={remove}
          />
        </div>
      </div>
      <label>
        Título
        <input
          maxLength={guideLimits.title}
          required={Boolean(block.text.trim())}
          value={block.title}
          onChange={editTitle}
        />
      </label>
      <label>
        Texto
        <textarea
          rows={2}
          maxLength={guideLimits.text}
          value={block.text}
          onChange={editText}
        />
      </label>
    </fieldset>
  )
}

function BlockButton({
  label,
  path,
  disabled,
  onClick,
}: {
  label: string
  path: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    </button>
  )
}
