"use server"

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
  getCostumeState,
  reserveCostume,
} from "./reservations"

export interface PickerState {
  current: string | null
  blocked: boolean
  added: string[]
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
      return { current: null, blocked: true, added: [], result: "signed-out" }
    }

    const userId = user.id
    const [choice, added] = await Promise.all([
      getCostumeState(userId),
      getAddedCharacters(),
    ])
    const state = {
      current: choice.current,
      blocked: choice.remaining === 0,
      added,
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
    if (form.get("intent") === "add") {
      const name = known ?? (await addCharacter(key, requested))
      return {
        ...state,
        added: known ? added : [...added, name],
        result: "added",
      }
    }

    if (form.get("intent") === "add-reserve" && !known) {
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
      result,
    }
  } catch {
    return { current: null, blocked: true, added: [], result: "error" }
  }
}
