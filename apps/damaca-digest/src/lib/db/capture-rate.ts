import "server-only"

import { MongoServerError } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"

export async function allowCapture(ownerId: string, now = Date.now()) {
  const minute = Math.floor(now / 60_000)
  const collection = await getCollection<{
    _id: string
    count: number
    expiresAt: Date
  }>(COLLECTION_NAMES.captureLimits)
  const id = `${ownerId}:${minute}`
  const update = { $inc: { count: 1 } }
  try {
    const bucket = await collection.findOneAndUpdate(
      { _id: id },
      {
        ...update,
        $setOnInsert: { expiresAt: new Date((minute + 2) * 60_000) },
      },
      { upsert: true, returnDocument: "after" }
    )
    return !!bucket && bucket.count <= 30
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error
    const bucket = await collection.findOneAndUpdate({ _id: id }, update, {
      returnDocument: "after",
    })
    return !!bucket && bucket.count <= 30
  }
}
