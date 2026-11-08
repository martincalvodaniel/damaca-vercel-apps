"use client"

import {
  type DragEvent,
  type MouseEvent,
  type ReactNode,
  useActionState,
  useCallback,
  useId,
  useRef,
  useState,
} from "react"
import {
  addEventCar,
  createAttendee,
  updateAttendance,
  updateEventCar,
} from "./actions"
import styles from "./page.module.css"

type Block = { id: string; label: string }
type Member = { id: string; alias: string }
type Attendee = Member & { status: string; memberId?: string }

export function AttendanceBoard({
  blocks,
  roster,
  members,
  canManage,
  mode = "attendance",
}: {
  blocks: Block[]
  roster: Attendee[]
  members: Member[]
  canManage: boolean
  mode?: "attendance" | "cars"
}) {
  const [message, setMessage] = useState("")
  const move = useCallback(
    async (id: string, status: string) => {
      const form = new FormData()
      form.set("member", id)
      form.set("status", status)
      try {
        setMessage(
          await (mode === "cars" ? updateEventCar : updateAttendance)("", form)
        )
      } catch {
        setMessage("No se pudo mover el asistente.")
      }
    },
    [mode]
  )
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
            mode={mode}
          />
        ))}
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
  mode,
}: {
  block: Block
  roster: Attendee[]
  members: Member[]
  canManage: boolean
  mode: "attendance" | "cars"
  move: (id: string, status: string) => Promise<void>
}) {
  const guests = roster.filter(({ status }) => status === block.id)
  const assignedMemberIds = new Set(roster.map(({ memberId }) => memberId))
  const available = members.filter(({ id }) => !assignedMemberIds.has(id))
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
      if (!result) closePicker()
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
  const dragType = `application/x-ebrias-${mode}`
  const dragOver = useCallback(
    (event: DragEvent) => {
      if (canManage && event.dataTransfer.types.includes(dragType))
        event.preventDefault()
    },
    [canManage, dragType]
  )
  const drop = useCallback(
    (event: DragEvent) => {
      if (!canManage) return
      const id = event.dataTransfer.getData(dragType)
      if (!id) return
      event.preventDefault()
      if (roster.some((guest) => guest.id === id && guest.status !== block.id))
        void move(id, block.id)
    },
    [block.id, canManage, dragType, move, roster]
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
        {canManage && mode === "attendance" ? (
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
      {canManage && mode === "attendance" ? (
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
            <AttendeeRow
              key={guest.id}
              guest={guest}
              canManage={canManage}
              dragType={dragType}
            />
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AttendeeRow({
  guest,
  canManage,
  dragType,
}: {
  guest: Attendee
  canManage: boolean
  dragType: string
}) {
  const drag = useCallback(
    (event: DragEvent) => {
      event.dataTransfer.setData(dragType, guest.id)
      event.dataTransfer.effectAllowed = "move"
    },
    [guest.id, dragType]
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

export function CarSection({
  canManage,
  children,
}: {
  canManage: boolean
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const openDialog = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    dialog.current?.showModal()
    dialog.current?.querySelector("input")?.focus()
  }, [])
  const closeDialog = useCallback(() => dialog.current?.close(), [])
  const [message, action, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const result = await addEventCar(previous, form)
      if (!result) dialog.current?.close()
      return result
    },
    ""
  )

  return (
    <details name="letux-sections" className={styles.attendees}>
      <summary className={styles.carSummary}>
        Reparto de coches
        {canManage ? (
          <button
            type="button"
            className={styles.addCar}
            aria-label="Añadir coche"
            aria-haspopup="dialog"
            onClick={openDialog}
          >
            +
          </button>
        ) : null}
      </summary>
      {children}
      {canManage ? (
        <dialog
          ref={dialog}
          className={styles.carDialog}
          aria-labelledby={titleId}
        >
          <h2 id={titleId}>Añadir coche</h2>
          <form action={action} className={styles.picker}>
            <label>
              Nombre del coche
              <input name="name" required maxLength={60} />
            </label>
            <p role="status" hidden={!message}>
              {message}
            </p>
            <div className={styles.carDialogActions}>
              <button type="button" onClick={closeDialog}>
                Cancelar
              </button>
              <button type="submit" disabled={pending}>
                Crear coche
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </details>
  )
}
