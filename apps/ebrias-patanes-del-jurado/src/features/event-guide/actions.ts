"use server"

import { revalidatePath } from "next/cache"
import { getAuthorizedUser } from "@/lib/session"
import { parseGuide } from "./guide"
import { writeGuide } from "./store"

export async function saveGuide(revision: number, input: unknown) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden editar la guía."
  }
  const guide = parseGuide(input)
  if (!Number.isSafeInteger(revision) || revision < 0 || !guide) {
    return "Revisa los bloques. Cada bloque con texto necesita un título."
  }

  try {
    if (!(await writeGuide(revision, guide))) {
      return "Otra persona guardó una versión más reciente. Tu texto sigue aquí. Cópialo antes de volver a abrir el editor."
    }
  } catch {
    return "No se pudo guardar la guía. Puedes volver a intentarlo."
  }

  revalidatePath("/eventos/26-12-30-nochevieja-letux")
  return null
}
