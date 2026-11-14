"use client"

import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  type SubmitEvent,
  useCallback,
  useState,
  useTransition,
} from "react"
import { saveGuide } from "@/features/event-guide/actions"
import {
  type EventGuide,
  type GuideBlock,
  guideLimits,
  guideNotes,
  guideSections,
} from "@/features/event-guide/guide"
import styles from "./guide.module.css"

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
        {guideNotes.map(({ id, label }) => (
          <label key={id}>
            {label}
            <textarea
              rows={2}
              maxLength={guideLimits.text}
              value={draft.notes[id]}
              name={id}
              onChange={editNote}
            />
          </label>
        ))}
        {guideSections.map(({ id, label }) => (
          <GuideSectionFields
            key={id}
            label={label}
            section={id}
            blocks={draft.sections[id]}
            setDraft={setDraft}
          />
        ))}
        <div className={styles.controls}>
          <button className={styles.primary} type="submit">
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
  blocks,
  section,
  setDraft,
}: {
  label: string
  blocks: GuideBlock[]
  section: keyof EventGuide["sections"]
  setDraft: Dispatch<SetStateAction<EventGuide>>
}) {
  const setBlocks = useCallback(
    (update: (blocks: GuideBlock[]) => GuideBlock[]) => {
      setDraft((current) => ({
        ...current,
        sections: {
          ...current.sections,
          [section]: update(current.sections[section]),
        },
      }))
    },
    [section, setDraft]
  )

  const addBlock = useCallback(() => {
    const block = { id: crypto.randomUUID(), title: "", text: "" }
    setBlocks((current) => [...current, block])
  }, [setBlocks])

  const removeBlock = useCallback(
    (blockId: string) => {
      setBlocks((current) => current.filter(({ id }) => id !== blockId))
    },
    [setBlocks]
  )

  const moveBlock = useCallback(
    (id: string, direction: -1 | 1) => {
      setBlocks((current) => {
        const index = current.findIndex((block) => block.id === id)
        const target = index + direction
        const block = current[index]
        if (!block || target < 0 || target >= current.length) return current
        const next = [...current]
        next.splice(index, 1)
        next.splice(target, 0, block)
        return next
      })
    },
    [setBlocks]
  )

  const editBlock = useCallback(
    (id: string, field: "title" | "text", value: string) => {
      setBlocks((current) =>
        current.map((block) =>
          block.id === id ? { ...block, [field]: value } : block
        )
      )
    },
    [setBlocks]
  )

  return (
    <fieldset className={styles.fields}>
      <legend>{label}</legend>
      {blocks.map((block, index) => (
        <GuideBlockFields
          key={block.id}
          block={block}
          index={index}
          last={index === blocks.length - 1}
          moveBlock={moveBlock}
          editBlock={editBlock}
          removeBlock={removeBlock}
        />
      ))}
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
    <fieldset className={styles.blockFields}>
      <legend>Bloque {index + 1}</legend>
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
          rows={3}
          maxLength={guideLimits.text}
          value={block.text}
          onChange={editText}
        />
      </label>
      <div className={styles.controls}>
        <button type="button" disabled={index === 0} onClick={moveUp}>
          Subir
        </button>
        <button type="button" disabled={last} onClick={moveDown}>
          Bajar
        </button>
        <button type="button" onClick={remove}>
          Eliminar
        </button>
      </div>
    </fieldset>
  )
}
