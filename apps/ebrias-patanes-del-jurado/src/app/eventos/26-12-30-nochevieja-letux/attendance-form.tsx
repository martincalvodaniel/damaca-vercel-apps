"use client"

import { useActionState } from "react"
import { addAttendanceBlock, updateAttendance } from "./actions"

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
        Miembro
        <select name="member" required>
          <option value="">Selecciona un miembro</option>
          {roster.map(({ id, alias, status }) => (
            <option key={id} value={id}>
              {alias} · {labels.get(status)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Asistencia
        <select name="status" required>
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
