import "server-only"

import { getDatabaseConnection } from "@/lib/database"

export const unassignedCar = "unassigned"

function cars(event: string) {
  return getDatabaseConnection().db.collection<{ _id: string; label: string }>(
    `${event}-cars`
  )
}

function assignments(event: string) {
  return getDatabaseConnection().db.collection<{ _id: string; carId: string }>(
    `${event}-car-assignments`
  )
}

export async function getCarBoard(event: string) {
  const [vehicles, assigned] = await Promise.all([
    cars(event).find().sort({ label: 1 }).toArray(),
    assignments(event).find().toArray(),
  ])
  return {
    blocks: [
      { id: unassignedCar, label: "Sin asignar" },
      ...vehicles.map(({ _id, label }) => ({ id: _id, label })),
    ],
    assigned: new Map(assigned.map(({ _id, carId }) => [_id, carId])),
  }
}

export async function createCar(event: string, label: string) {
  const id = label.normalize("NFC").toLocaleLowerCase("es")
  if (id === "sin asignar") return false
  const result = await cars(event).updateOne(
    { _id: `car:${id}` },
    { $setOnInsert: { label } },
    { upsert: true }
  )
  return result.upsertedCount === 1
}

export async function deleteCar(event: string, carId: string) {
  if (!carId.startsWith("car:") || carId === unassignedCar) return false
  const result = await cars(event).deleteOne({ _id: carId })
  if (!result.deletedCount) return false
  await assignments(event).deleteMany({ carId })
  return true
}

export async function assignCar(
  event: string,
  attendeeId: string,
  carId: string
) {
  const db = getDatabaseConnection().db
  if (
    !(await db
      .collection<{ _id: string }>(`${event}-attendees`)
      .findOne({ _id: attendeeId }))
  )
    return false
  if (carId === unassignedCar) {
    await assignments(event).deleteOne({ _id: attendeeId })
  } else {
    if (!(await cars(event).findOne({ _id: carId }))) return false
    await assignments(event).updateOne(
      { _id: attendeeId },
      { $set: { carId } },
      { upsert: true }
    )
  }
  return true
}

export async function renameCar(event: string, id: string, label: string) {
  if (!id.startsWith("car:")) return false
  const collection = cars(event)
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

export async function unassignCar(
  event: string,
  attendeeId: string,
  carId: string
) {
  return (
    (await assignments(event).deleteOne({ _id: attendeeId, carId }))
      .deletedCount === 1
  )
}
