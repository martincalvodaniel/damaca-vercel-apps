import "server-only"

import { MongoServerError } from "mongodb"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"

export function allowCapture(ownerId: string, now = Date.now()) {
  const minute = Math.floor(now / 60_000)
  return allowRateBucket(
    `${ownerId}:${minute}`,
    new Date((minute + 2) * 60_000),
    30
  )
}

export async function allowRateBucket(
  id: string,
  expiresAt: Date,
  limit: number,
  signal?: AbortSignal
) {
  const collection = await getCollection<{
    _id: string
    count: number
    expiresAt: Date
  }>(COLLECTION_NAMES.captureLimits)
  signal?.throwIfAborted()
  const update = { $inc: { count: 1 } }
  try {
    const bucket = await collection.findOneAndUpdate(
      { _id: id },
      {
        ...update,
        $setOnInsert: { expiresAt: expiresAt },
      },
      {
        upsert: true,
        returnDocument: "after",
        timeoutMS: signal ? 1000 : undefined,
      }
    )
    return !!bucket && bucket.count <= limit
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000)
      throw error
    const bucket = await collection.findOneAndUpdate({ _id: id }, update, {
      returnDocument: "after",
      timeoutMS: signal ? 1000 : undefined,
    })
    return !!bucket && bucket.count <= limit
  }
}
