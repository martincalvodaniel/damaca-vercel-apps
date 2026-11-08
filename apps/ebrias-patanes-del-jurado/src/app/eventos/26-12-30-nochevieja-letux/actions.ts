"use server"

import { revalidatePath } from "next/cache"
import {
  addAttendee,
  createAttendanceBlock,
  getAttendanceBlocks,
  letuxEvent,
  setAttendance,
} from "@/features/members/attendance"
import { canManageAttendance } from "@/lib/session"

export async function updateAttendance(_previous: string, form: FormData) {
  if (!(await canManageAttendance())) {
    return "Solo los miembros del club y los administradores pueden cambiar la asistencia."
  }

  const member = form.get("member")
  const status = form.get("status")
  if (
    typeof member !== "string" ||
    member.length > 100 ||
    typeof status !== "string" ||
    status.length > 150
  ) {
    return "Comprueba el miembro y la asistencia."
  }

  try {
    const blocks = await getAttendanceBlocks(letuxEvent)
    if (!blocks.some(({ id }) => id === status)) {
      return "Comprueba el bloque de asistencia."
    }
    if (!(await setAttendance(letuxEvent, member, status))) {
      return "No se encontró ese asistente."
    }
  } catch {
    return "No se pudo guardar la asistencia."
  }

  revalidatePath("/eventos/26-12-30-nochevieja-letux")
  return "Asistencia guardada."
}

export async function addAttendanceBlock(_previous: string, form: FormData) {
  if (!(await canManageAttendance())) {
    return "Solo los miembros del club y los administradores pueden crear bloques."
  }

  const name = form.get("name")
  const label =
    typeof name === "string" ? name.trim().replace(/\s+/gu, " ") : ""
  if (!label || label.length > 60)
    return "Introduce un nombre de hasta 60 caracteres."

  try {
    if (!(await createAttendanceBlock(letuxEvent, label))) {
      return "Ya existe un bloque con ese nombre."
    }
  } catch {
    return "No se pudo crear el bloque."
  }

  revalidatePath("/eventos/26-12-30-nochevieja-letux")
  return "Bloque creado."
}

export async function createAttendee(_previous: string, form: FormData) {
  if (!(await canManageAttendance()))
    return "No tienes permiso para gestionar asistentes."
  const name = String(form.get("name") ?? "").trim()
  const member = String(form.get("member") ?? "")
  if ((!member && !name) || name.length > 80 || member.length > 100)
    return "Selecciona un miembro o escribe el nombre del invitado."
  const status = form.get("status")
  try {
    const blocks = await getAttendanceBlocks(letuxEvent)
    if (typeof status !== "string" || !blocks.some(({ id }) => id === status))
      return "Bloque no válido."
    if (!(await addAttendee(letuxEvent, name, member, status)))
      return "El miembro no está disponible o ya está en la lista."
  } catch {
    return "No se pudo añadir el asistente."
  }
  revalidatePath("/eventos/26-12-30-nochevieja-letux")
  return "Asistente añadido."
}
