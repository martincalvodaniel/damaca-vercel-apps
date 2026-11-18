import "server-only"

import { randomUUID } from "node:crypto"
import { MongoServerError } from "mongodb"
import { allowRateBucket } from "@/lib/db/capture-rate"
import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"

export function allowArticleFetch(ownerId: string, now = Date.now()) {
  const minute = Math.floor(now / 60_000)
  return allowRateBucket(
    `fetch:minute:${ownerId}:${minute}`,
    new Date((minute + 2) * 60_000),
    5
  )
}

export function allowFirecrawl(
  limit: number,
  now = Date.now(),
  signal?: AbortSignal
) {
  const day = Math.floor(now / 86_400_000)
  return allowRateBucket(
    `fetch:firecrawl:day:${day}`,
    new Date((day + 2) * 86_400_000),
    limit,
    signal
  )
}

export async function acquireArticleFetch(ownerId: string, now = Date.now()) {
  const collection = await getCollection<{
    _id: string
    lease: string
    expiresAt: Date
  }>(COLLECTION_NAMES.captureLimits)
  const id = `fetch:lease:${ownerId}`
  const lease = randomUUID()
  try {
    const acquired = await collection.findOneAndUpdate(
      { _id: id, expiresAt: { $lte: new Date(now) } },
      { $set: { lease, expiresAt: new Date(now + 45_000) } },
      { upsert: true, returnDocument: "after" }
    )
    if (!acquired) return null
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) return null
    throw error
  }
  return async () => {
    await collection.deleteOne({ _id: id, lease })
  }
}
