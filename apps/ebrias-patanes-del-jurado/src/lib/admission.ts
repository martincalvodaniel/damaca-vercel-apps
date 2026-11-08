import "server-only"

import { MongoServerError } from "mongodb"
import { aliases, memberCollection } from "@/features/members/directory"
import { getDatabaseConnection } from "@/lib/database"
import { notifyAdmission } from "./admission-push"

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
    revoked?: true
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
    revoked: { $exists: false },
  }))
    ? "member"
    : null
}

export async function requestAdmission(user: Identity & { name: string }) {
  const email = normalizeEmail(user.email)
  if (!user.emailVerified || !email) return

  try {
    const result = await admissions().updateOne(
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
    if (result.upsertedCount)
      await notifyAdmission().catch(() => {
        console.error("Admission push delivery failed")
      })
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000))
      throw error
  }
}

export function listPendingAdmissions() {
  return admissions().find({ pending: true }).sort({ requestedAt: 1 }).toArray()
}

export async function deletePendingAdmission(email: string) {
  const result = await admissions().deleteOne({
    _id: normalizeEmail(email),
    pending: true,
  })
  return result.deletedCount > 0
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
      if (admission?.revoked) return false
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

export async function replaceMemberEmail(
  memberId: string,
  previous: string,
  next: string
) {
  if (previous === next || isAdmin(previous) || isAdmin(next)) return false

  const { client, db } = getDatabaseConnection()
  return client.withSession((session) =>
    session.withTransaction(async () => {
      const members = memberCollection()
      const member = await members.findOne({ _id: memberId }, { session })
      const request = await admissions().findOne({ _id: next }, { session })
      if (
        member?.email === next &&
        request?.memberId === memberId &&
        request.requestedAt &&
        !request.pending
      ) {
        return (
          (await admissions().findOne(
            { _id: previous, revoked: true, memberId },
            { session }
          )) !== null
        )
      }
      if (member?.email !== previous || !request?.pending || request.revoked)
        return false
      if (await members.findOne({ email: next }, { session })) return false

      const previousAlias = member.aliasUpdated
        ? null
        : await aliases().findOne({ _id: previous }, { session })
      const previousUser = await db
        .collection("user")
        .findOne({ email: previous, emailVerified: true }, { session })
      const owners = db.collection<{ _id: string; ownerId: string }>(
        "261230-costume-owners"
      )
      const owner = await owners.findOne({ _id: memberId }, { session })
      const previousOwnerId =
        owner?.ownerId ?? (previousUser ? String(previousUser._id) : null)
      const previousChoice =
        previousOwnerId &&
        (await db
          .collection<{ _id: string }>("261230-costume-choices")
          .findOne({ _id: previousOwnerId }, { session }))

      await members.updateOne(
        { _id: memberId, email: previous },
        {
          $set: {
            email: next,
            alias: previousAlias?.alias ?? member.alias,
            aliasUpdated: true,
          },
        },
        { session }
      )
      if (previousChoice && previousOwnerId) {
        await owners.updateOne(
          { _id: memberId },
          { $set: { ownerId: previousOwnerId } },
          { session, upsert: true }
        )
      }
      await admissions().updateOne(
        { _id: previous },
        {
          $set: { revoked: true, memberId },
          $unset: { pending: "" },
        },
        { session, upsert: true }
      )
      await admissions().updateOne(
        { _id: next, pending: true },
        {
          $set: { memberId },
          $unset: { pending: "" },
        },
        { session }
      )
      return true
    })
  )
}

export function countPendingAdmissions() {
  return admissions().countDocuments({ pending: true })
}
