import "server-only"

import { getDatabaseConnection } from "@/lib/database"

export function memberCollection() {
  return getDatabaseConnection().db.collection<{
    _id: string
    alias: string
    email?: string
  }>("members")
}

function aliases() {
  return getDatabaseConnection().db.collection<{ _id: string; alias: string }>(
    "display-aliases"
  )
}

export async function getDisplayAlias(email: string, fallback: string) {
  const override = await aliases().findOne({ _id: email })
  if (override) return override.alias
  return (await memberCollection().findOne({ email }))?.alias ?? fallback
}

export async function saveDisplayAlias(email: string, alias: string) {
  await aliases().updateOne(
    { _id: email },
    { $set: { alias } },
    { upsert: true }
  )
}

export async function getMemberDirectory() {
  const members = await memberCollection().find().toArray()
  const emails = members.flatMap(({ email }) => (email ? [email] : []))
  const overrides = await aliases()
    .find({ _id: { $in: emails } })
    .toArray()
  const byEmail = new Map(overrides.map(({ _id, alias }) => [_id, alias]))
  return members
    .map(({ _id, alias, email }) => ({
      id: _id,
      alias: (email && byEmail.get(email)) || alias,
      email,
    }))
    .sort((a, b) => a.alias.localeCompare(b.alias, "es"))
}
