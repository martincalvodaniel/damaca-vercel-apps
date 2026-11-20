"use client"

import { type DBSchema, openDB } from "idb"
import { makeRecoveryDeviceKey } from "./contact-crypto"

type DeviceKey = Awaited<ReturnType<typeof makeRecoveryDeviceKey>>

interface RecoveryDatabase extends DBSchema {
  keys: { key: string; value: DeviceKey }
}

function openRecoveryDatabase() {
  return openDB<RecoveryDatabase>("damaca-secrets-recovery", 1, {
    upgrade(database) {
      database.createObjectStore("keys")
    },
  })
}

function keyId(ownerId: string, purpose: "contact" | "request", id: string) {
  return JSON.stringify([ownerId, purpose, id])
}

export async function getRecoveryDeviceKey(
  ownerId: string,
  purpose: "contact" | "request",
  id: string
) {
  const database = await openRecoveryDatabase()
  try {
    return await database.get("keys", keyId(ownerId, purpose, id))
  } finally {
    database.close()
  }
}

export async function createRecoveryDeviceKey(
  ownerId: string,
  purpose: "contact" | "request",
  id: string
) {
  const existing = await getRecoveryDeviceKey(ownerId, purpose, id)
  if (existing) return existing

  const generated = await makeRecoveryDeviceKey()
  const database = await openRecoveryDatabase()
  try {
    const transaction = database.transaction("keys", "readwrite")
    const slot = keyId(ownerId, purpose, id)
    const current = await transaction.store.get(slot)
    if (!current) await transaction.store.add(generated, slot)
    await transaction.done
    return current ?? generated
  } finally {
    database.close()
  }
}

export async function removeRecoveryDeviceKey(
  ownerId: string,
  purpose: "contact" | "request",
  id: string
) {
  const database = await openRecoveryDatabase()
  try {
    await database.delete("keys", keyId(ownerId, purpose, id))
  } finally {
    database.close()
  }
}
