import "server-only"

import { MongoServerError } from "mongodb"
import { memberCollection } from "@/features/members/directory"
import { getDatabaseConnection } from "@/lib/database"

interface Identity {
  email: string
  emailVerified: boolean
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isAdmin(email: string) {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .some((entry) => normalizeEmail(entry) === email)
}

function admissions() {
  return getDatabaseConnection().db.collection<{
    _id: string
    pending?: true
    requestedAt?: Date
    name?: string
    memberId?: string
  }>("admitted-emails")
}

export async function getAccessRole(user: Identity) {
  if (!user.emailVerified) return null

  const email = normalizeEmail(user.email)
  if (!email) return null
  if (isAdmin(email)) return "admin"

  return (await admissions().findOne({
    _id: email,
    pending: { $exists: false },
  }))
    ? "member"
    : null
}

export async function requestAdmission(user: Identity & { name: string }) {
  const email = normalizeEmail(user.email)
  if (!user.emailVerified || !email) return

  try {
    await admissions().updateOne(
      { _id: email },
      {
        $setOnInsert: {
          pending: true,
          requestedAt: new Date(),
          name: user.name.trim().slice(0, 80),
        },
      },
      { upsert: true }
    )
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000))
      throw error
  }
}

export function listPendingAdmissions() {
  return admissions().find({ pending: true }).sort({ requestedAt: 1 }).toArray()
}

export async function admitEmail(email: string, target: string) {
  const { client } = getDatabaseConnection()
  return client.withSession((session) =>
    session.withTransaction(async () => {
      const admission = await admissions().findOneAndUpdate(
        { _id: email },
        { $unset: { pending: "" }, $setOnInsert: { _id: email } },
        { session, upsert: true, returnDocument: "after" }
      )
      const members = memberCollection()
      const current = await members.findOne({ email }, { session })
      if (current) return !target || target === "new" || target === current._id

      let memberId = target
      if (target && target !== "new") {
        const updated = await members.updateOne(
          { _id: target, email: { $exists: false } },
          { $set: { email } },
          { session }
        )
        if (!updated.matchedCount) throw new Error("Member is unavailable")
      } else if (target === "new" || admission?.requestedAt) {
        memberId = crypto.randomUUID()
        await members.insertOne(
          {
            _id: memberId,
            email,
            alias: admission?.name || email.split("@")[0],
          },
          { session }
        )
      }
      if (memberId) {
        await admissions().updateOne(
          { _id: email },
          { $set: { memberId } },
          { session }
        )
      }
      return true
    })
  )
}
