"use server"

import { revalidatePath } from "next/cache"
import { canManageAttendance } from "@/lib/session"
import { moveItem } from "./list"
import { readShoppingList, updateShoppingList } from "./store"

export async function changeShoppingList(form: FormData) {
  if (!(await canManageAttendance()))
    return "No tienes permiso para editar la lista."
  const intent = form.get("intent")
  const id = form.get("id")
  const target = form.get("target")
  const enteredName = form.get("name")
  const name = typeof enteredName === "string" ? enteredName.trim() : ""
  if (
    (intent === "add" || intent === "rename") &&
    (!name || name.length > 100)
  ) {
    return "Escribe un nombre de hasta 100 caracteres."
  }
  const newId = crypto.randomUUID()
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { revision, items } = await readShoppingList()
    if (intent !== "add" && !items.some((item) => item.id === id))
      return "El elemento ya no está en la lista."
    let updated = items
    if (intent === "add") {
      if (items.length >= 250) return "La lista ya tiene 250 elementos."
      updated = [...items, { id: newId, name, checked: false }]
    } else if (intent === "rename") {
      updated = items.map((item) => (item.id === id ? { ...item, name } : item))
    } else if (intent === "check") {
      const checked = form.get("checked")
      if (checked !== "true" && checked !== "false")
        return "Marca o desmarca el elemento."
      updated = items.map((item) =>
        item.id === id ? { ...item, checked: checked === "true" } : item
      )
    } else if (intent === "remove" && form.get("confirm") === "yes") {
      updated = items.filter((item) => item.id !== id)
    } else if (
      intent === "move" &&
      typeof id === "string" &&
      typeof target === "string"
    ) {
      if (!items.some((item) => item.id === target))
        return "El destino ya no está en la lista."
      updated = moveItem(items, id, target)
    } else {
      return "Acción no válida."
    }
    if (updated === items || (await updateShoppingList(revision, updated))) {
      revalidatePath("/eventos/26-12-30-nochevieja-letux")
      return ""
    }
  }
  return "La lista acaba de cambiar. Inténtalo de nuevo."
}
