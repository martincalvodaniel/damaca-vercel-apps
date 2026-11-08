"use server"

import { headers } from "next/headers"
import { getAuth } from "@/lib/auth"
import {
  canonicalCharacter,
  characterCatalog,
  normalizeCharacter,
} from "./characters"
import {
  addCharacter,
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
    const session = await getAuth().api.getSession({ headers: await headers() })
    if (!session?.user.emailVerified) {
      return { current: null, blocked: true, added: [], result: "signed-out" }
    }

    const userId = session.user.id
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

    if (!known || form.get("intent") !== "reserve")
      return { ...state, result: "invalid" }
    const result = await reserveCostume(userId, key, known)
    const updated = await getCostumeState(userId)
    return {
      current: updated.current,
      blocked: updated.remaining === 0,
      added,
      result,
    }
  } catch {
    return { current: null, blocked: true, added: [], result: "error" }
  }
}
