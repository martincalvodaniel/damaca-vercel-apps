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

const letuxRoster = [
  {
    status: "overnight",
    aliases: [
      "Álvaro",
      "Víctor",
      "Dani",
      "Pali",
      "Borja",
      "Andrea",
      "Ángela",
      "Sergio",
      "Pat",
      "Adri",
      "Lis",
      "Pit",
    ],
  },
  { status: "day", aliases: ["Lu", "La", "Ma", "Bebé2"] },
  { status: "pending", aliases: ["Diana"] },
] as const

function attendanceCollection(event: string) {
  return getDatabaseConnection().db.collection<{
    _id: string
    status: string
  }>(`${event}-attendance`)
}

export async function seedLetuxRoster() {
  const roster = letuxRoster.flatMap(({ status, aliases }) =>
    aliases.map((alias) => ({
      id: `letux:${alias.toLowerCase()}`,
      alias,
      status,
    }))
  )
  await Promise.all([
    memberCollection().bulkWrite(
      roster.map(({ id, alias }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $setOnInsert: { alias } },
          upsert: true,
        },
      }))
    ),
    attendanceCollection(letuxEvent).bulkWrite(
      roster.map(({ id, status }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $setOnInsert: { status } },
          upsert: true,
        },
      }))
    ),
  ])
}

export async function getEventRoster(event: string) {
  const [members, attendance] = await Promise.all([
    getMemberDirectory(),
    attendanceCollection(event).find().toArray(),
  ])
  const statuses = new Map(attendance.map(({ _id, status }) => [_id, status]))
  return members.map(({ id, alias }) => ({
    id,
    alias,
    status: statuses.get(id) ?? "absent",
  }))
}

export async function setAttendance(
  event: string,
  memberId: string,
  status: string
) {
  if (!(await memberCollection().findOne({ _id: memberId }))) return false
  await attendanceCollection(event).updateOne(
    { _id: memberId },
    { $set: { status } },
    { upsert: true }
  )
  return true
}
