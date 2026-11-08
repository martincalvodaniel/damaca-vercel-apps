"use server"

import { revalidatePath } from "next/cache"
import { getAuthorizedUser } from "@/lib/session"
import {
  canonicalCharacter,
  characterCatalog,
  normalizeCharacter,
} from "./characters"
import {
  addCharacter,
  deleteCharacterIfUnselected,
  getAddedCharacters,
  getCharacterCreationEnabled,
  getCostumeOwnerId,
  getCostumeState,
  reserveCostume,
  setCharacterCreationEnabled,
} from "./reservations"

export interface PickerState {
  current: string | null
  blocked: boolean
  added: string[]
  allowAdd: boolean
  result?:
    | "reserved"
    | "taken"
    | "locked"
    | "added"
    | "invalid"
    | "error"
    | "signed-out"
}

export async function submitCostume(
  _previous: PickerState,
  form: FormData
): Promise<PickerState> {
  try {
    const user = await getAuthorizedUser()
    if (!user) {
      return {
        current: null,
        blocked: true,
        added: [],
        allowAdd: false,
        result: "signed-out",
      }
    }

    const userId = await getCostumeOwnerId(user.email, user.id)
    const [choice, added, allowAdd] = await Promise.all([
      getCostumeState(userId),
      getAddedCharacters(),
      getCharacterCreationEnabled(),
    ])
    const state = {
      current: choice.current,
      blocked: choice.remaining === 0,
      added,
      allowAdd,
    }
    const value = form.get("character")
    if (
      typeof value !== "string" ||
      value.length > 80 ||
      /[\p{Cc}\p{Cf}]/u.test(value)
    ) {
      return { ...state, result: "invalid" }
    }

    const requested = canonicalCharacter(value.trim().replace(/\s+/gu, " "))
    const key = normalizeCharacter(requested)
    if (key.length < 2) return { ...state, result: "invalid" }
    if (state.blocked) return { ...state, result: "locked" }

    const known = [...characterCatalog, ...added].find(
      (name) => normalizeCharacter(name) === key
    )
    if (form.get("intent") === "add" && allowAdd) {
      const name = known ?? (await addCharacter(key, requested))
      return {
        ...state,
        added: known ? added : [...added, name],
        result: "added",
      }
    }

    if (form.get("intent") === "add-reserve" && !known && allowAdd) {
      const name = await addCharacter(key, requested)
      const result = await reserveCostume(userId, key, name)
      if (result !== "reserved") await deleteCharacterIfUnselected(key)
      const updated = await getCostumeState(userId)
      if (result === "reserved" && choice.current) {
        const previousKey = normalizeCharacter(choice.current)
        if (
          !characterCatalog.some(
            (item) => normalizeCharacter(item) === previousKey
          )
        ) {
          await deleteCharacterIfUnselected(previousKey)
        }
      }
      return {
        current: updated.current,
        blocked: updated.remaining === 0,
        added: await getAddedCharacters(),
        allowAdd,
        result,
      }
    }

    if (!known || form.get("intent") !== "reserve")
      return { ...state, result: "invalid" }
    const result = await reserveCostume(userId, key, known)
    if (result === "reserved" && choice.current) {
      const previousKey = normalizeCharacter(choice.current)
      if (
        !characterCatalog.some(
          (item) => normalizeCharacter(item) === previousKey
        )
      ) {
        await deleteCharacterIfUnselected(previousKey)
      }
    }
    const updated = await getCostumeState(userId)
    return {
      current: updated.current,
      blocked: updated.remaining === 0,
      added: await getAddedCharacters(),
      allowAdd,
      result,
    }
  } catch {
    return {
      current: null,
      blocked: true,
      added: [],
      allowAdd: false,
      result: "error",
    }
  }
}

export async function setCharacterCreation(_previous: string, form: FormData) {
  if ((await getAuthorizedUser())?.role !== "admin") {
    return "Solo los administradores pueden cambiar esta opción."
  }
  const enabled = form.get("enabled") === "true"
  try {
    await setCharacterCreationEnabled(enabled)
    revalidatePath("/eventos/26-12-30-nochevieja-letux/disfraces")
    return enabled
      ? "Creación de personajes habilitada."
      : "Creación de personajes deshabilitada."
  } catch {
    return "No se pudo guardar la opción."
  }
}
