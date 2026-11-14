import "server-only"

import { MongoServerError } from "mongodb"
import { getDatabaseConnection } from "@/lib/database"
import { type EventGuide, emptyGuide } from "./guide"

function collection() {
  return getDatabaseConnection().db.collection<{
    _id: string
    revision: number
    guide: EventGuide
  }>("261230-event-guide")
}

export async function readGuide() {
  return (
    (await collection().findOne({ _id: "guide" })) ?? {
      revision: 0,
      guide: emptyGuide(),
    }
  )
}

export async function writeGuide(revision: number, guide: EventGuide) {
  const guides = collection()
  if (revision === 0) {
    try {
      await guides.insertOne({ _id: "guide", revision: 1, guide })
      return true
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000)
        return false
      throw error
    }
  }

  const result = await guides.updateOne(
    { _id: "guide", revision },
    { $set: { guide }, $inc: { revision: 1 } }
  )
  return result.matchedCount === 1
}
