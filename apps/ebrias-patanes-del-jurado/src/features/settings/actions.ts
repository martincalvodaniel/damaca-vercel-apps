"use server"

import { revalidatePath } from "next/cache"
import { deleteMember } from "@/features/members/delete-member"
import { saveDisplayAlias, saveMemberAlias } from "@/features/members/directory"
import {
  admitEmail,
  deletePendingAdmission,
  normalizeEmail,
  replaceMemberEmail,
} from "@/lib/admission"
import { getAuthorizedUser } from "@/lib/session"

export async function approveEmail(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden autorizar correos."
  }

  const value = form.get("email")
  const email = typeof value === "string" ? normalizeEmail(value) : ""
  const target = form.get("member")
  if (
    email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email) ||
    typeof target !== "string" ||
    target.length > 100
  ) {
    return "Comprueba el correo y el miembro seleccionado."
  }

  try {
    if (!(await admitEmail(email, target))) {
      return "Ese correo ya está asociado a otro miembro."
    }
  } catch {
    return "No se pudo guardar. Comprueba si el miembro ya tiene otro correo."
  }

  revalidatePath("/settings")
  revalidatePath("/eventos", "layout")
  return `${email} ya puede entrar con Google.`
}

export async function deleteAdmissionRequest(
  _previous: string,
  form: FormData
) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden eliminar solicitudes."
  }

  const value = form.get("email")
  const email = typeof value === "string" ? normalizeEmail(value) : ""
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email)) {
    return "La solicitud no es válida."
  }

  try {
    if (!(await deletePendingAdmission(email))) {
      return "La solicitud ya no está pendiente."
    }
  } catch {
    return "No se pudo eliminar la solicitud. Inténtalo de nuevo."
  }

  revalidatePath("/settings")
  return "Solicitud eliminada."
}

export async function updateAlias(_previous: string, form: FormData) {
  const user = await getAuthorizedUser()
  if (!user) return "Vuelve a iniciar sesión."

  const value = form.get("alias")
  const alias = typeof value === "string" ? value.trim() : ""
  if (!alias || alias.length > 80 || /\p{Cc}/u.test(alias)) {
    return "Introduce un alias de entre 1 y 80 caracteres."
  }

  try {
    const memberId = form.get("aliasMember")
    if (memberId !== null) {
      if (user.role !== "admin")
        return "Solo los administradores pueden editar otros alias."
      if (
        typeof memberId !== "string" ||
        !(await saveMemberAlias(memberId, alias))
      ) {
        return "No se encontró el miembro."
      }
    } else {
      await saveDisplayAlias(normalizeEmail(user.email), alias)
    }
  } catch {
    return "No se pudo guardar el alias."
  }

  revalidatePath("/settings")
  revalidatePath("/eventos", "layout")
  return "Alias guardado."
}

export async function changeMemberEmail(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden cambiar el correo."
  }
  const selection = form.get("memberToChange")
  const email = form.get("email")
  if (
    typeof selection !== "string" ||
    typeof email !== "string" ||
    selection.length > 400 ||
    email.length > 254
  ) {
    return "Selecciona un miembro y una solicitud."
  }
  const separator = selection.indexOf("|")
  const memberId = separator > 0 ? selection.slice(0, separator) : ""
  const previous = selection.slice(separator + 1)
  if (!memberId || !previous || form.get("confirm") !== "on") {
    return "Confirma los dos correos antes de guardar."
  }
  try {
    if (
      !(await replaceMemberEmail(memberId, previous, normalizeEmail(email)))
    ) {
      return "No se puede cambiar el correo. Revisa el miembro y la solicitud."
    }
  } catch {
    return "No se pudo cambiar el correo. Inténtalo de nuevo."
  }
  revalidatePath("/settings")
  revalidatePath("/eventos", "layout")
  return "Correo actualizado."
}

export async function removeMember(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden eliminar miembros."
  }
  const id = form.get("memberId")
  if (typeof id !== "string" || !id || id.length > 100) {
    return "El miembro no es válido."
  }
  try {
    if (!(await deleteMember(id))) return "El miembro ya no existe."
  } catch {
    return "No se pudo eliminar el miembro."
  }
  revalidatePath("/settings")
  revalidatePath("/eventos", "layout")
  return "Miembro eliminado."
}
