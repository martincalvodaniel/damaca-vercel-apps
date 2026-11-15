import "server-only"

import { getMemberDirectory } from "@/features/members/directory"
import { getDatabaseConnection } from "@/lib/database"
import { getAuthorizedUser } from "@/lib/session"
import { type Actor, type Contest, emptyContest } from "./contest"

export const eventPath = "/eventos/26-12-30-nochevieja-letux"
export const contestPath = `${eventPath}/tapas`

export async function getContestActor(): Promise<Actor | null> {
  const user = await getAuthorizedUser()
  if (!user) return null
  const email = user.email.trim().toLowerCase()
  const member = (await getMemberDirectory()).find(
    (entry) => entry.email === email
  )
  return {
    admin: user.role === "admin",
    member: member && { id: member.id, alias: member.alias },
  }
}

function collection() {
  return getDatabaseConnection().db.collection<{
    _id: string
    revision: number
    contest: Contest
  }>("261230-tapas-contest")
}

export async function readContest() {
  return (
    (await collection().findOne({ _id: "contest" })) ?? {
      revision: 0,
      contest: emptyContest(),
    }
  )
}

export async function writeContest(revision: number, contest: Contest) {
  const contests = collection()
  if (revision === 0) {
    const result = await contests.updateOne(
      { _id: "contest" },
      { $setOnInsert: { revision: 1, contest } },
      { upsert: true }
    )
    return result.upsertedCount === 1
  }
  return (
    (
      await contests.updateOne(
        { _id: "contest", revision },
        { $set: { contest }, $inc: { revision: 1 } }
      )
    ).matchedCount === 1
  )
}
