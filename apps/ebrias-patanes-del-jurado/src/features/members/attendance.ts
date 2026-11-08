import "server-only"

import { getDatabaseConnection } from "@/lib/database"
import { getMemberDirectory, memberCollection } from "./directory"

export const letuxEvent = "261230"

const attendanceLabels = {
  overnight: "Estancia",
  day: "Comida y día del 31",
  pending: "Pendiente",
  absent: "No va",
} as const

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
  return [
    ...Object.entries(attendanceLabels).map(([id, label]) => ({ id, label })),
    ...custom.map(({ _id: id, label }) => ({ id, label })),
  ]
}

export async function createAttendanceBlock(event: string, label: string) {
  const normalized = label.normalize("NFC").toLowerCase()
  if (
    Object.values(attendanceLabels).some(
      (existing) => existing.toLowerCase() === normalized
    )
  )
    return false

  const result = await attendanceBlockCollection(event).updateOne(
    { _id: `custom:${normalized}` },
    { $setOnInsert: { label } },
    { upsert: true }
  )
  return result.upsertedCount === 1
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
