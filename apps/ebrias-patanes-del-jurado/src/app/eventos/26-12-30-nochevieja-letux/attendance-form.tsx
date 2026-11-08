"use client"

import { type DragEvent, useActionState, useCallback, useState } from "react"
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
            blocks={blocks}
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
  blocks,
  roster,
  members,
  canManage,
  move,
}: {
  block: Block
  blocks: Block[]
  roster: Attendee[]
  members: Member[]
  canManage: boolean
  move: (id: string, status: string) => Promise<void>
}) {
  const guests = roster.filter(({ status }) => status === block.id)
  const available = members.filter(
    ({ id }) => !guests.some(({ memberId }) => memberId === id)
  )
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((value) => !value), [])
  const [message, action, pending] = useActionState(createAttendee, "")
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
            onClick={toggle}
            aria-expanded={open}
            aria-label={`Añadir a ${block.label}`}
          >
            +
          </button>
        ) : null}
      </div>
      {open && canManage ? (
        <form action={action} className="account admission-form">
          <input type="hidden" name="status" value={block.id} />
          <label>
            Miembro del club
            <select name="member" className="member-select">
              <option value="">Invitado sin vínculo</option>
              {available.map(({ id, alias }) => (
                <option key={id} value={id}>
                  {alias}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nombre del invitado
            <input name="name" maxLength={80} />
          </label>
          <button type="submit" disabled={pending}>
            Añadir
          </button>
          <p role="status">{message}</p>
        </form>
      ) : null}
      {guests.length ? (
        <ul>
          {guests.map((guest) => (
            <AttendeeRow
              key={guest.id}
              guest={guest}
              blocks={blocks}
              canManage={canManage}
            />
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AttendeeRow({
  guest,
  blocks,
  canManage,
}: {
  guest: Attendee
  blocks: Block[]
  canManage: boolean
}) {
  const drag = useCallback(
    (event: DragEvent) => {
      event.dataTransfer.setData("application/x-ebrias-attendee", guest.id)
      event.dataTransfer.effectAllowed = "move"
    },
    [guest.id]
  )
  const [message, remove, pending] = useActionState(updateAttendance, "")
  return (
    <li draggable={canManage} onDragStart={canManage ? drag : undefined}>
      {guest.alias}
      {canManage ? (
        <details>
          <summary>Opciones</summary>
          <form action={remove} className={styles.attendeeActions}>
            <input type="hidden" name="member" value={guest.id} />
            <select
              name="status"
              defaultValue={guest.status}
              aria-label={`Bloque de ${guest.alias}`}
            >
              {blocks.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <button type="submit" disabled={pending}>
              Mover
            </button>
            <button
              type="submit"
              name="intent"
              value="remove"
              aria-label={`Quitar a ${guest.alias}`}
              disabled={pending}
            >
              ×
            </button>
            <span role="status">{message}</span>
          </form>
        </details>
      ) : null}
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
