"use client"

import {
  type DragEvent,
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
} from "react"
import { addAttendanceBlock, createAttendee, updateAttendance } from "./actions"
import styles from "./page.module.css"

type Block = { id: string; label: string }
type Member = { id: string; alias: string }
type Attendee = Member & { status: string; memberId?: string }

export function AttendanceBoard({
  blocks,
  roster,
  members,
  canManage,
}: {
  blocks: Block[]
  roster: Attendee[]
  members: Member[]
  canManage: boolean
}) {
  const [message, setMessage] = useState("")
  const move = useCallback(async (id: string, status: string) => {
    const form = new FormData()
    form.set("member", id)
    form.set("status", status)
    try {
      setMessage(await updateAttendance("", form))
    } catch {
      setMessage("No se pudo mover el asistente.")
    }
  }, [])
  return (
    <div className={styles.roster}>
      {blocks
        .filter(({ id }) => canManage || id !== "absent")
        .map((block) => (
          <AttendanceSection
            key={block.id}
            block={block}
            roster={roster}
            members={members}
            canManage={canManage}
            move={move}
          />
        ))}
      {canManage ? <BlockForm /> : null}
      <p role="status" hidden={!message}>
        {message}
      </p>
    </div>
  )
}

function AttendanceSection({
  block,
  roster,
  members,
  canManage,
  move,
}: {
  block: Block
  roster: Attendee[]
  members: Member[]
  canManage: boolean
  move: (id: string, status: string) => Promise<void>
}) {
  const guests = roster.filter(({ status }) => status === block.id)
  const available = members.filter(
    ({ id }) => !guests.some(({ memberId }) => memberId === id)
  )
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [query, setQuery] = useState("")
  const search = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }, [])
  const openPicker = useCallback(() => {
    setQuery("")
    dialog.current?.showModal()
    dialog.current?.querySelector("input")?.focus()
  }, [])
  const closePicker = useCallback(() => dialog.current?.close(), [])
  const submit = useCallback(
    async (previous: string, form: FormData) => {
      const result = await createAttendee(previous, form)
      if (result === "Asistente añadido.") closePicker()
      return result
    },
    [closePicker]
  )
  const [message, action, pending] = useActionState(submit, "")
  const name = query.trim()
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es")
  const matches = available.filter(({ alias }) =>
    normalize(alias).includes(normalize(name))
  )
  const dragOver = useCallback(
    (event: DragEvent) => {
      if (
        canManage &&
        event.dataTransfer.types.includes("application/x-ebrias-attendee")
      )
        event.preventDefault()
    },
    [canManage]
  )
  const drop = useCallback(
    (event: DragEvent) => {
      if (!canManage) return
      const id = event.dataTransfer.getData("application/x-ebrias-attendee")
      if (!id) return
      event.preventDefault()
      if (roster.some((guest) => guest.id === id && guest.status !== block.id))
        void move(id, block.id)
    },
    [block.id, canManage, move, roster]
  )

  return (
    <section
      aria-label={block.label}
      className={styles.card}
      onDragOver={dragOver}
      onDrop={drop}
    >
      <div className={styles.blockHeader}>
        <h2>
          {block.label} ({guests.length})
        </h2>
        {canManage ? (
          <button
            className={styles.addAttendee}
            type="button"
            onClick={openPicker}
            aria-haspopup="dialog"
            aria-label={`Añadir a ${block.label}`}
          >
            +
          </button>
        ) : null}
      </div>
      {canManage ? (
        <dialog
          ref={dialog}
          className={styles.attendeeDialog}
          aria-labelledby={titleId}
        >
          <div className={styles.blockHeader}>
            <h2 id={titleId}>Añadir a {block.label}</h2>
            <button
              type="button"
              className={styles.addAttendee}
              onClick={closePicker}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <form action={action} className="account admission-form">
            <input type="hidden" name="status" value={block.id} />
            <label>
              Buscar miembro o escribir un nombre
              <input
                name="name"
                type="search"
                value={query}
                onChange={search}
                maxLength={80}
              />
            </label>
            {name ? (
              <button type="submit" name="member" value="" disabled={pending}>
                Añadir «{name}» como invitado
              </button>
            ) : null}
            <ul className={styles.memberResults}>
              {matches.map(({ id, alias }) => (
                <li key={id}>
                  <button
                    type="submit"
                    name="member"
                    value={id}
                    disabled={pending}
                  >
                    {alias}
                  </button>
                </li>
              ))}
            </ul>
            {matches.length === 0 ? (
              <p>No hay miembros que coincidan.</p>
            ) : null}
            <p role="status">{message}</p>
          </form>
        </dialog>
      ) : null}
      {guests.length ? (
        <ul>
          {guests.map((guest) => (
            <AttendeeRow key={guest.id} guest={guest} canManage={canManage} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AttendeeRow({
  guest,
  canManage,
}: {
  guest: Attendee
  canManage: boolean
}) {
  const drag = useCallback(
    (event: DragEvent) => {
      event.dataTransfer.setData("application/x-ebrias-attendee", guest.id)
      event.dataTransfer.effectAllowed = "move"
    },
    [guest.id]
  )
  return (
    <li
      className={canManage ? styles.movableAttendee : undefined}
      draggable={canManage}
      onDragStart={canManage ? drag : undefined}
    >
      {canManage ? <span aria-hidden="true">⠿</span> : null}
      {guest.alias}
    </li>
  )
}

function BlockForm() {
  const [message, action, pending] = useActionState(addAttendanceBlock, "")
  return (
    <details>
      <summary>Añadir bloque</summary>
      <form action={action} className="account admission-form">
        <label>
          Nombre del bloque
          <input name="name" required maxLength={60} />
        </label>
        <button type="submit" disabled={pending}>
          Crear bloque
        </button>
        <p role="status">{message}</p>
      </form>
    </details>
  )
}
