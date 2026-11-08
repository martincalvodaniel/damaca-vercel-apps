"use server"

import { admitEmail, normalizeEmail } from "@/lib/admission"
import { getAuthorizedUser } from "@/lib/session"

export async function approveEmail(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden autorizar correos."
  }

  const value = form.get("email")
  const email = typeof value === "string" ? normalizeEmail(value) : ""
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(email)) {
    return "Introduce un correo válido."
  }

  try {
    await admitEmail(email)
    return `${email} ya puede entrar con Google.`
  } catch {
    return "No se pudo autorizar el correo. Inténtalo de nuevo."
  }
}
