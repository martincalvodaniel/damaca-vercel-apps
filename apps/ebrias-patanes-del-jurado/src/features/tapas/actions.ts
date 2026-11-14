"use server"

import { revalidatePath } from "next/cache"
import { getEventRoster, letuxEvent } from "@/features/members/attendance"
import { getMemberDirectory } from "@/features/members/directory"
import { applyContestAction, ContestError } from "./contest"
import {
  contestPath,
  getContestActor,
  readContest,
  writeContest,
} from "./store"

export async function submitContest(
  _previous: string,
  form: FormData
): Promise<string> {
  const actor = await getContestActor()
  if (!actor) return "Inicia sesión para continuar."
  const intent = form.get("intent")
  const opening = intent === "open" && actor.admin
  const [people, roster] = await Promise.all([
    (intent === "save" && actor.member) || opening ? getMemberDirectory() : [],
    opening ? getEventRoster(letuxEvent) : [],
  ])
  const context = {
    people: people.map(({ id, alias }) => ({ id, alias })),
    roster: roster.map(({ id, alias, memberId }) => ({
      id,
      alias,
      ...(memberId && { memberId }),
    })),
    newId: crypto.randomUUID(),
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { revision, contest } = await readContest()
    try {
      const next = applyContestAction(contest, actor, form, context)
      if (await writeContest(revision, next)) {
        revalidatePath(contestPath)
        return ""
      }
    } catch (error) {
      if (error instanceof ContestError) return error.message
      throw error
    }
  }
  return "El concurso acaba de cambiar. Vuelve a intentarlo."
}
