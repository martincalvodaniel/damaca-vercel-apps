import "server-only"

import { getDatabaseConnection } from "@/lib/database"
import { getMemberDirectory, memberCollection } from "./directory"

export const letuxEvent = "261230"

const unassignedAttendance = "unassigned"

function attendanceBlockCollection(event: string) {
  return getDatabaseConnection().db.collection<{
    _id: string
    label: string
  }>(`${event}-attendance-blocks`)
}

export async function getAttendanceBlocks(event: string) {
  const custom = await attendanceBlockCollection(event)
    .find()
    .sort({ _id: 1 })
    .toArray()
  return custom.map(({ _id: id, label }) => ({ id, label }))
}

export async function createAttendanceBlock(event: string, label: string) {
  const normalized = label.normalize("NFC").toLowerCase()

  const result = await attendanceBlockCollection(event).updateOne(
    { _id: `custom:${normalized}` },
    { $setOnInsert: { label } },
    { upsert: true }
  )
  return result.upsertedCount === 1
}

export async function deleteAttendanceBlock(event: string, id: string) {
  if (!id.startsWith("custom:")) return false
  const result = await attendanceBlockCollection(event).deleteOne({ _id: id })
  if (!result.deletedCount) return false
  await attendees(event).updateMany(
    { status: id },
    { $set: { status: unassignedAttendance } }
  )
  return true
}

function attendees(event: string) {
  return getDatabaseConnection().db.collection<{
    _id: string
    name: string
    memberId?: string
    status: string
  }>(`${event}-attendees`)
}

export async function getEventRoster(event: string) {
  const [roster, members] = await Promise.all([
    attendees(event).find().toArray(),
    getMemberDirectory(),
  ])
  const aliases = new Map(members.map(({ id, alias }) => [id, alias]))
  return roster
    .map(({ _id: id, name, memberId, status }) => ({
      id,
      memberId,
      alias: (memberId && aliases.get(memberId)) || name,
      status,
    }))
    .sort((a, b) => a.alias.localeCompare(b.alias, "es"))
}

export async function addAttendee(
  event: string,
  name: string,
  memberId: string,
  status: string
) {
  const member = memberId
    ? await memberCollection().findOne({ _id: memberId })
    : null
  if (memberId && !member) return false
  const id = member ? `member:${member._id}` : crypto.randomUUID()
  const result = await attendees(event).updateOne(
    { _id: id },
    {
      $set: { status },
      $setOnInsert: {
        name: member?.alias ?? name,
        ...(member && { memberId }),
      },
    },
    { upsert: true }
  )
  return result.upsertedCount === 1 || result.matchedCount === 1
}

export async function setAttendance(event: string, id: string, status: string) {
  return (
    (await attendees(event).updateOne({ _id: id }, { $set: { status } }))
      .matchedCount === 1
  )
}

export async function renameAttendanceBlock(
  event: string,
  id: string,
  label: string
) {
  if (!id.startsWith("custom:")) return false
  const collection = attendanceBlockCollection(event)
  const duplicate = await collection.findOne(
    { _id: { $ne: id }, label },
    { collation: { locale: "es", strength: 2 } }
  )
  if (duplicate) return false
  return (
    (await collection.updateOne({ _id: id }, { $set: { label } }))
      .matchedCount === 1
  )
}

export async function removeAttendee(
  event: string,
  id: string,
  status: string
) {
  const { client, db } = getDatabaseConnection()
  return client.withSession((session) =>
    session.withTransaction(async () => {
      const result = await attendees(event).deleteOne(
        { _id: id, status },
        { session }
      )
      if (!result.deletedCount) return false
      await db
        .collection<{ _id: string }>(`${event}-car-assignments`)
        .deleteOne({ _id: id }, { session })
      return true
    })
  )
}
