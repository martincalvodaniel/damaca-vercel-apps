"use client"

import { useActionState } from "react"
import { addAttendanceBlock, createAttendee, updateAttendance } from "./actions"

export function AttendanceForm({
  roster,
  blocks,
}: {
  roster: { id: string; alias: string; status: string }[]
  blocks: { id: string; label: string }[]
}) {
  const [message, action, pending] = useActionState(updateAttendance, "")

  const labels = new Map(blocks.map(({ id, label }) => [id, label]))

  return (
    <form action={action} className="account admission-form">
      <label>
        Asistente
        <select name="member" required>
          <option value="">Selecciona un asistente</option>
          {roster.map(({ id, alias, status }) => (
            <option key={id} value={id}>
              {alias} · {labels.get(status)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Asistencia
        <select name="status">
          <option value="">Selecciona un bloque</option>
          {blocks.map(({ id: status, label }) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar asistencia"}
      </button>
      <button type="submit" name="intent" value="remove" disabled={pending}>
        Quitar asistente
      </button>
      <p role="status">{message}</p>
    </form>
  )
}

export function AttendanceBlockForm() {
  const [message, action, pending] = useActionState(addAttendanceBlock, "")

  return (
    <form action={action} className="account admission-form">
      <label>
        Nombre del nuevo bloque
        <input name="name" required maxLength={60} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear bloque"}
      </button>
      <p role="status">{message}</p>
    </form>
  )
}

export function AttendeeForm({
  members,
}: {
  members: { id: string; alias: string }[]
}) {
  const [message, action, pending] = useActionState(createAttendee, "")
  return (
    <form action={action} className="account admission-form">
      <label>
        Miembro del club
        <select name="member" className="member-select">
          <option value="">Invitado sin vínculo</option>
          {members.map(({ id, alias }) => (
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
        Añadir asistente
      </button>
      <p role="status">{message}</p>
    </form>
  )
}
