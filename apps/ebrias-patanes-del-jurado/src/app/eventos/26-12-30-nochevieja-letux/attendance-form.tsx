"use client"

import { useActionState } from "react"
import { updateAttendance } from "./actions"

export function AttendanceForm({
  roster,
  labels,
}: {
  roster: { id: string; alias: string; status: string }[]
  labels: Record<string, string>
}) {
  const [message, action, pending] = useActionState(updateAttendance, "")

  return (
    <form action={action} className="account admission-form">
      <label>
        Miembro
        <select name="member" required>
          <option value="">Selecciona un miembro</option>
          {roster.map(({ id, alias, status }) => (
            <option key={id} value={id}>
              {alias} · {labels[status]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Asistencia
        <select name="status" required>
          <option value="">Selecciona un estado</option>
          {Object.entries(labels).map(([status, label]) => (
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
