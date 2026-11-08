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
  addAttendanceBlock,
  addEventCar,
  createAttendee,
  removeEventAttendee,
  removeEventBlock,
  renameEventBlock,
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
  const blockIds = new Set(blocks.map(({ id }) => id))
  const assignedMemberIds = new Set(
    roster
      .filter(({ status }) => blockIds.has(status))
      .map(({ memberId }) => memberId)
  )
  const available = members.filter(({ id }) => !assignedMemberIds.has(id))
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
            members={available}
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
  const submit = useCallback(async (previous: string, form: FormData) => {
    const result = await createAttendee(previous, form)
    if (!result) {
      if (!form.get("member")) setQuery("")
      if (dialog.current?.open) {
        dialog.current
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus()
      }
    }
    return result
  }, [])
  const [message, action, pending] = useActionState(submit, "")
  const name = query.trim()
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es")
  const matches = members.filter(({ alias }) =>
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
        {canManage ? (
          <div className={styles.blockActions}>
            {block.id.startsWith("custom:") ||
            (mode === "cars" && block.id.startsWith("car:")) ? (
              <>
                <EditBlock mode={mode} block={block} />
                <RemoveEntry mode={mode} id={block.id} label={block.label} />
              </>
            ) : null}
            {mode === "attendance" ? (
              <button
                className={styles.addAttendee}
                type="button"
                onClick={openPicker}
                aria-haspopup="dialog"
                aria-label={`Añadir a ${block.label}`}
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
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {canManage && mode === "attendance" ? (
        <dialog
          closedby="any"
          ref={dialog}
          className={styles.carDialog}
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
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <form action={action} className={styles.picker}>
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
              mode={mode}
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
  mode,
}: {
  guest: Attendee
  canManage: boolean
  dragType: string
  mode: "attendance" | "cars"
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
      <span className={styles.attendeeName}>{guest.alias}</span>
      {canManage && (mode === "attendance" || guest.status !== "unassigned") ? (
        <RemoveEntry
          mode={mode}
          id={guest.id}
          label={guest.alias}
          status={guest.status}
        />
      ) : null}
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
          closedby="any"
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

export function AttendanceBlocksSection({
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
      const result = await addAttendanceBlock(previous, form)
      if (!result) dialog.current?.close()
      return result
    },
    ""
  )
  return (
    <details name="letux-sections" className={styles.attendees}>
      <summary className={styles.carSummary}>
        ¿Quién viene?
        {canManage ? (
          <button
            type="button"
            className={styles.addCar}
            aria-label="Añadir bloque"
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
          closedby="any"
          ref={dialog}
          className={styles.carDialog}
          aria-labelledby={titleId}
        >
          <h2 id={titleId}>Añadir bloque</h2>
          <form action={action} className={styles.picker}>
            <label>
              Nombre del bloque
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
                Crear bloque
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </details>
  )
}

function RemoveEntry({
  mode,
  id,
  label,
  status,
}: {
  mode: "attendance" | "cars"
  id: string
  label: string
  status?: string
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const openDialog = useCallback(() => dialog.current?.showModal(), [])
  const closeDialog = useCallback(() => dialog.current?.close(), [])
  const titleId = useId()
  const [message, action, pending] = useActionState(
    async (previous: string, form: FormData) => {
      if (status === undefined) return removeEventBlock(previous, form)
      const result = await removeEventAttendee(previous, form)
      if (!result) closeDialog()
      return result
    },
    ""
  )
  const title =
    status === undefined ? `Eliminar «${label}»` : `Quitar a «${label}»`
  const description =
    status === undefined
      ? "¿Seguro que quieres eliminar este bloque?"
      : mode === "cars"
        ? "Dejará de estar en este coche y pasará a Sin asignar."
        : "Se quitará de la lista de asistencia y del coche que tenga asignado."
  return (
    <>
      <button
        className={styles.removeBlock}
        type="button"
        onClick={openDialog}
        aria-label={title}
        aria-haspopup="dialog"
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
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <dialog
        closedby="any"
        ref={dialog}
        className={styles.carDialog}
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        <form
          action={action}
          className={`${styles.carDialogActions} ${styles.picker}`}
        >
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="id" value={id} />
          {status !== undefined ? (
            <input type="hidden" name="status" value={status} />
          ) : null}
          <button type="button" onClick={closeDialog}>
            Cancelar
          </button>
          <button type="submit" disabled={pending}>
            {status === undefined ? "Eliminar" : "Quitar"}
          </button>
        </form>
        <p role="status">{message}</p>
      </dialog>
    </>
  )
}

function EditBlock({
  mode,
  block,
}: {
  mode: "attendance" | "cars"
  block: Block
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const openDialog = useCallback(() => {
    dialog.current?.querySelector("form")?.reset()
    dialog.current?.showModal()
  }, [])
  const closeDialog = useCallback(() => dialog.current?.close(), [])
  const [message, action, pending] = useActionState(
    async (previous: string, form: FormData) => {
      const result = await renameEventBlock(previous, form)
      if (!result) closeDialog()
      return result
    },
    ""
  )

  return (
    <>
      <button
        type="button"
        className={styles.addAttendee}
        aria-label={`Editar ${block.label}`}
        aria-haspopup="dialog"
        onClick={openDialog}
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
          <path d="m4 20 4-1 11-11-3-3L5 16zM14 7l3 3" />
        </svg>
      </button>
      <dialog
        closedby="any"
        ref={dialog}
        className={styles.carDialog}
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>Editar «{block.label}»</h2>
        <form action={action} className={styles.picker}>
          <input type="hidden" name="id" value={block.id} />
          <input type="hidden" name="mode" value={mode} />
          <label>
            Nombre
            <input
              name="name"
              defaultValue={block.label}
              required
              maxLength={60}
            />
          </label>
          <p role="status" hidden={!message}>
            {message}
          </p>
          <div className={styles.carDialogActions}>
            <button type="button" onClick={closeDialog}>
              Cancelar
            </button>
            <button type="submit" disabled={pending}>
              Guardar
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
