import "server-only"

import { createHash, randomUUID } from "node:crypto"
import { MongoServerError } from "mongodb"
import { getDatabase } from "./database"

type VoiceCapture =
  | { kind: "shopping"; text: string }
  | { kind: "reminder"; text: string; dueAt: Date }

type ChatCapture =
  | { kind: "summary"; title: string; text: string }
  | { kind: "link"; url: string; title?: string }

export type CaptureInput =
  | (VoiceCapture & { source: "alexa"; requestId: string })
  | (ChatCapture & { source: "chatgpt" })

export type Capture = CaptureInput & {
  _id: string
  ownerId: string
  createdAt: Date
}

function collection() {
  return getDatabase().database.collection<Capture>("captures")
}

export async function saveCapture(ownerId: string, input: CaptureInput) {
  const id =
    input.source === "alexa"
      ? createHash("sha256")
          .update(JSON.stringify([ownerId, input.source, input.requestId]))
          .digest("hex")
      : randomUUID()

  try {
    await collection().insertOne({
      ...input,
      _id: id,
      ownerId,
      createdAt: new Date(),
    })
  } catch (error) {
    if (
      input.source !== "alexa" ||
      !(error instanceof MongoServerError) ||
      error.code !== 11000 ||
      !(await collection().findOne({ _id: id, ownerId, source: "alexa" }))
    ) {
      throw error
    }
  }
  return id
}

export function listCaptures(ownerId: string) {
  return collection()
    .find({ ownerId })
    .sort({ createdAt: -1, _id: -1 })
    .limit(100)
    .toArray()
}
