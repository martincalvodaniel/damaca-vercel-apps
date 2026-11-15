import "server-only"

import {
  getMemberDirectory,
  memberCollection,
} from "@/features/members/directory"
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

export async function readAwardAvatars(ids: string[]) {
  const avatars = new Map<string, string>()
  if (!ids.length) return avatars
  const members = await memberCollection()
    .find(
      { _id: { $in: ids }, email: { $exists: true } },
      { projection: { email: 1 } }
    )
    .toArray()
  const emails = members.flatMap(({ email }) => (email ? [email] : []))
  if (!emails.length) return avatars
  const users = await getDatabaseConnection()
    .db.collection<{ email: string; image?: string }>("user")
    .find({ email: { $in: emails } }, { projection: { email: 1, image: 1 } })
    .toArray()
  const images = new Map(users.map(({ email, image }) => [email, image]))
  for (const { _id, email } of members) {
    const image = email && images.get(email)
    if (image && /^https:\/\/lh[0-9]+\.googleusercontent\.com\//u.test(image))
      avatars.set(_id, image)
  }
  return avatars
}
