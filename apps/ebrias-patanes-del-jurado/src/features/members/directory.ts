import "server-only"

import { getDatabaseConnection } from "@/lib/database"

export function memberCollection() {
  return getDatabaseConnection().db.collection<{
    _id: string
    alias: string
    email?: string
    aliasUpdated?: true
    costumeOwnerId?: string
  }>("members")
}

export function aliases() {
  return getDatabaseConnection().db.collection<{ _id: string; alias: string }>(
    "display-aliases"
  )
}

export async function getDisplayAlias(email: string, fallback: string) {
  const member = await memberCollection().findOne({ email })
  if (member?.aliasUpdated) return member.alias
  return (
    (await aliases().findOne({ _id: email }))?.alias ??
    member?.alias ??
    fallback
  )
}

export async function saveDisplayAlias(email: string, alias: string) {
  const result = await memberCollection().updateOne(
    { email },
    { $set: { alias, aliasUpdated: true } }
  )
  if (!result.matchedCount) {
    await aliases().updateOne(
      { _id: email },
      { $set: { alias } },
      { upsert: true }
    )
  }
}

export async function saveMemberAlias(id: string, alias: string) {
  const result = await memberCollection().updateOne(
    { _id: id },
    { $set: { alias, aliasUpdated: true } }
  )
  return result.matchedCount > 0
}

export async function getCostumeOwnerId(email: string, userId: string) {
  const member = await memberCollection().findOne({
    email: email.trim().toLowerCase(),
  })
  return member?.costumeOwnerId ?? userId
}

export async function getMemberDirectory() {
  const members = await memberCollection().find().toArray()
  const emails = members.flatMap(({ email }) => (email ? [email] : []))
  const overrides = await aliases()
    .find({ _id: { $in: emails } })
    .toArray()
  const byEmail = new Map(overrides.map(({ _id, alias }) => [_id, alias]))
  return members
    .map(({ _id, alias, email, aliasUpdated }) => ({
      id: _id,
      alias: (!aliasUpdated && email && byEmail.get(email)) || alias,
      email,
    }))
    .sort((a, b) => a.alias.localeCompare(b.alias, "es"))
}
