import { expect, it, mock, spyOn } from "bun:test"
import { Collection, type Document, MongoServerError, ObjectId } from "mongodb"
import type { Capture } from "./captures"

mock.module("server-only", () => ({}))

it("deduplicates Alexa retries and queries only the signed-in owner's entries", async () => {
  const { saveCapture, listCaptures } = await import("./captures")
  const previous = { ...process.env }
  const documents = new Map<string, Capture>()
  Object.assign(process.env, {
    BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
    GOOGLE_CLIENT_ID: "test",
    GOOGLE_CLIENT_SECRET: "test",
    MONGODB_URI: "mongodb://localhost:27017",
  })
  const insert = spyOn(Collection.prototype, "insertOne").mockImplementation(
    async (input) => {
      const entry = input as Capture
      if (documents.has(entry._id)) throw new MongoServerError({ code: 11000 })
      documents.set(entry._id, entry)
      return { acknowledged: true, insertedId: new ObjectId() }
    }
  )
  const findOne = spyOn(Collection.prototype, "findOne").mockImplementation(
    async (filter?: Document) => {
      const entry = documents.get(String(filter?._id))
      return entry?.ownerId === filter?.ownerId ? (entry ?? null) : null
    }
  )
  const find = spyOn(Collection.prototype, "find")

  try {
    const input = {
      kind: "shopping",
      source: "alexa",
      requestId: "same",
      text: "Leche",
    } as const
    const first = await saveCapture("first-owner", input)
    expect(await saveCapture("first-owner", input)).toBe(first)
    expect(await saveCapture("second-owner", input)).not.toBe(first)
    expect(documents.size).toBe(2)

    const stopCursor = new Error("Stop before querying MongoDB")
    find.mockImplementation(() => {
      throw stopCursor
    })
    expect(() => listCaptures("first-owner")).toThrow(stopCursor)
    expect(find).toHaveBeenCalledWith({ ownerId: "first-owner" })
  } finally {
    find.mockRestore()
    findOne.mockRestore()
    insert.mockRestore()
    for (const key of [
      "BETTER_AUTH_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "MONGODB_URI",
    ]) {
      const value = previous[key]
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
