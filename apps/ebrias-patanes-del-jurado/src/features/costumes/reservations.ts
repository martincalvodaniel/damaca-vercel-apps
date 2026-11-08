import "server-only"

import { MongoServerError } from "mongodb"
import { getDatabaseConnection } from "@/lib/database"

interface Choice {
  _id: string
  attempts: number
  extra?: boolean
  characterKey?: string
  characterName?: string
}

const normalLimit = 3

function choices() {
  return getDatabaseConnection().db.collection<Choice>("261230-costume-choices")
}

function characters() {
  return getDatabaseConnection().db.collection<{ _id: string; name: string }>(
    "261230-costume-characters"
  )
}

let indexReady: Promise<string> | undefined

function ensureUniqueChoices() {
  indexReady ??= choices()
    .createIndex({ characterKey: 1 }, { unique: true, sparse: true })
    .catch((error: unknown) => {
      indexReady = undefined
      throw error
    })
  return indexReady
}

function remaining(choice: Choice | null) {
  return Math.max(
    0,
    normalLimit + Number(choice?.extra === true) - (choice?.attempts ?? 0)
  )
}

export async function getCostumeState(userId: string) {
  const choice = await choices().findOne({ _id: userId })
  return {
    current: choice?.characterName ?? null,
    remaining: remaining(choice),
  }
}

export async function getAddedCharacters() {
  return (
    await characters()
      .find({}, { projection: { name: 1 } })
      .toArray()
  ).map(({ name }) => name)
}

export async function addCharacter(key: string, name: string) {
  await characters().updateOne(
    { _id: key },
    { $setOnInsert: { name } },
    { upsert: true }
  )
  return (await characters().findOne({ _id: key }))?.name ?? name
}

export async function deleteCharacterIfUnselected(key: string) {
  const selected = await choices().countDocuments({ characterKey: key })
  if (selected > 0) return
  await characters().deleteOne({ _id: key })
}

function isDuplicate(error: unknown) {
  return error instanceof MongoServerError && error.code === 11000
}

export async function reserveCostume(
  userId: string,
  key: string,
  name: string
) {
  await ensureUniqueChoices()
  const collection = choices()

  try {
    await collection.updateOne(
      { _id: userId },
      { $setOnInsert: { attempts: 0 } },
      { upsert: true }
    )
  } catch (error) {
    if (!isDuplicate(error)) throw error
  }

  for (let retry = 0; retry < 5; retry++) {
    const choice = await collection.findOne({ _id: userId })
    if (!choice) throw new Error("Costume choice is missing")
    if (choice.characterKey === key) return "reserved"
    if (remaining(choice) === 0) return "locked"

    const filter = { _id: userId, attempts: choice.attempts }
    try {
      const result = await collection.updateOne(filter, {
        $inc: { attempts: 1 },
        $set: { characterKey: key, characterName: name },
      })
      if (result.matchedCount) return "reserved"
    } catch (error) {
      if (!isDuplicate(error)) throw error
      const result = await collection.updateOne(filter, {
        $inc: { attempts: 1 },
      })
      if (result.matchedCount) return "taken"
    }
  }

  throw new Error("Concurrent costume updates exceeded retry limit")
}

export async function grantFinalAttempt(userId: string) {
  const result = await choices().updateOne(
    { _id: userId, attempts: normalLimit, extra: { $ne: true } },
    { $set: { extra: true } }
  )
  return result.modifiedCount === 1
}
