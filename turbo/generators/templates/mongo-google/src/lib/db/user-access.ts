import "server-only"

import { COLLECTION_NAMES, getCollection } from "@/lib/db/collections"
import { accessEmailSchema } from "@/schemas/user-access"
import type {
  AccessRequestPage,
  AccessRequestStatus,
  UserAccessPage,
} from "@/types/access"

interface UserAccessDocument {
  email: string
  createdAt: Date
  status?: AccessRequestStatus
  requestId?: string
  requestedAt?: Date
  resolvedAt?: Date
}

const PAGE_SIZE = 50

async function getUserAccessCollection() {
  return getCollection<UserAccessDocument>(COLLECTION_NAMES.userAccess)
}

export async function hasUserAccess(email: string): Promise<boolean> {
  const collection = await getUserAccessCollection()
  const entry = await collection.findOne(
    {
      email: accessEmailSchema.parse(email),
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    },
    { projection: { _id: 1 } }
  )
  return entry !== null
}

export async function grantUserAccess(email: string): Promise<void> {
  const collection = await getUserAccessCollection()
  const normalizedEmail = accessEmailSchema.parse(email)
  try {
    await collection.updateOne(
      { email: normalizedEmail },
      {
        $set: { status: "approved" },
        $setOnInsert: { email: normalizedEmail, createdAt: new Date() },
      },
      { upsert: true }
    )
  } catch (error: unknown) {
    // Concurrent grants for the same normalized email are idempotent.
    if (!(error instanceof Error && "code" in error && error.code === 11000)) {
      throw error
    }
    // A concurrent request may have inserted the email first; still apply the grant.
    await collection.updateOne(
      { email: normalizedEmail },
      { $set: { status: "approved" } }
    )
  }
}

export async function revokeUserAccess(email: string): Promise<void> {
  const collection = await getUserAccessCollection()
  await collection.deleteOne({ email: accessEmailSchema.parse(email) })
}

export async function listUserAccess(after?: string): Promise<UserAccessPage> {
  const collection = await getUserAccessCollection()
  const filter = {
    ...(after ? { email: { $gt: accessEmailSchema.parse(after) } } : {}),
    $or: [{ status: "approved" as const }, { status: { $exists: false } }],
  }
  const documents = await collection
    .find(filter)
    .sort({ email: 1 })
    .limit(PAGE_SIZE + 1)
    .toArray()
  const entries = documents.slice(0, PAGE_SIZE).map((entry) => ({
    email: entry.email,
    createdAt: entry.createdAt.toISOString(),
  }))
  return {
    entries,
    nextCursor:
      documents.length > PAGE_SIZE ? entries[entries.length - 1].email : null,
  }
}

export async function getAccessRequestStatus(
  email: string
): Promise<AccessRequestStatus | null> {
  const collection = await getUserAccessCollection()
  const entry = await collection.findOne({
    email: accessEmailSchema.parse(email),
  })
  return entry ? (entry.status ?? "approved") : null
}

export async function submitAccessRequest(email: string): Promise<void> {
  const collection = await getUserAccessCollection()
  const normalizedEmail = accessEmailSchema.parse(email)
  const requestedAt = new Date()
  const requestId = crypto.randomUUID()
  // Reopening is conditional, so concurrent repeats preserve the first request ID.
  const reopened = await collection.updateOne(
    { email: normalizedEmail, status: "rejected" },
    {
      $set: { status: "pending", requestId, requestedAt },
      $unset: { resolvedAt: "" },
    }
  )
  if (reopened.modifiedCount > 0) return
  try {
    await collection.updateOne(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          email: normalizedEmail,
          createdAt: requestedAt,
          status: "pending",
          requestId,
          requestedAt,
        },
      },
      { upsert: true }
    )
  } catch (error: unknown) {
    if (!(error instanceof Error && "code" in error && error.code === 11000))
      throw error
  }
}

export async function resolveAccessRequest(
  email: string,
  requestId: string,
  decision: "approve" | "reject"
): Promise<boolean> {
  const collection = await getUserAccessCollection()
  // One conditional write both resolves the request and grants or denies access.
  const result = await collection.updateOne(
    { email: accessEmailSchema.parse(email), requestId, status: "pending" },
    {
      $set: {
        status: decision === "approve" ? "approved" : "rejected",
        resolvedAt: new Date(),
      },
    }
  )
  return result.modifiedCount === 1
}

export async function listAccessRequests(
  after?: string
): Promise<AccessRequestPage> {
  const collection = await getUserAccessCollection()
  const documents = await collection
    .find({
      status: "pending",
      ...(after ? { email: { $gt: accessEmailSchema.parse(after) } } : {}),
    })
    .sort({ email: 1 })
    .limit(PAGE_SIZE + 1)
    .toArray()
  const entries = documents.slice(0, PAGE_SIZE).map((entry) => {
    if (!entry.requestId || !entry.requestedAt)
      throw new Error("Invalid pending access request")
    return {
      email: entry.email,
      requestId: entry.requestId,
      requestedAt: entry.requestedAt.toISOString(),
    }
  })
  return {
    entries,
    nextCursor:
      documents.length > PAGE_SIZE ? entries[entries.length - 1].email : null,
  }
}
