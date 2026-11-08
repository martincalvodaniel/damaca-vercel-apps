"use server"

import { revalidatePath } from "next/cache"
import {
  type AttendanceStatus,
  attendanceLabels,
  letuxEvent,
  setAttendance,
} from "@/features/members/attendance"
import { getAuthorizedUser } from "@/lib/session"

export async function updateAttendance(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden cambiar la asistencia."
  }

  const member = form.get("member")
  const status = form.get("status")
  if (
    typeof member !== "string" ||
    member.length > 100 ||
    typeof status !== "string" ||
    !Object.hasOwn(attendanceLabels, status)
  ) {
    return "Comprueba el miembro y la asistencia."
  }

  try {
    if (
      !(await setAttendance(letuxEvent, member, status as AttendanceStatus))
    ) {
      return "No se encontró ese miembro."
    }
  } catch {
    return "No se pudo guardar la asistencia."
  }

  revalidatePath("/eventos/26-12-30-nochevieja-letux")
  return "Asistencia guardada."
}
