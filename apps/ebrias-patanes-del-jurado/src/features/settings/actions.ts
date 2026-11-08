"use server"

import { revalidatePath } from "next/cache"
import { saveDisplayAlias } from "@/features/members/directory"
import { admitEmail, normalizeEmail } from "@/lib/admission"
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

export async function updateAlias(_previous: string, form: FormData) {
  const user = await getAuthorizedUser()
  if (!user) return "Vuelve a iniciar sesión."

  const value = form.get("alias")
  const alias = typeof value === "string" ? value.trim() : ""
  if (!alias || alias.length > 80 || /\p{Cc}/u.test(alias)) {
    return "Introduce un alias de entre 1 y 80 caracteres."
  }

  try {
    await saveDisplayAlias(normalizeEmail(user.email), alias)
  } catch {
    return "No se pudo guardar el alias."
  }

  revalidatePath("/settings")
  revalidatePath("/eventos", "layout")
  return "Alias guardado."
}
