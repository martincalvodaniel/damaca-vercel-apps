"use client"

import { type DBSchema, openDB } from "idb"
import {
  type OfflineSnapshot,
  type OfflineState,
  offlineStateSchema,
  toOfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultRead } from "@/schemas/vault"

interface OfflineDatabase extends DBSchema {
  vault: { key: string; value: OfflineState }
}

const slot = "current"
const channelName = "damaca-secrets-offline"

function getDatabase() {
  return openDB<OfflineDatabase>("damaca-secrets", 1, {
    upgrade: (database) => database.createObjectStore("vault"),
  })
}

function parse(value: unknown) {
  return offlineStateSchema.safeParse(value).data
}

async function edit(
  change: (state: OfflineState | undefined) => OfflineState | undefined
) {
  const database = await getDatabase()
  try {
    const transaction = database.transaction("vault", "readwrite")
    const current = parse(await transaction.store.get(slot))
    const next = change(current)
    if (next) await transaction.store.put(next, slot)
    await transaction.done
    return next
  } finally {
    database.close()
  }
}

async function getState() {
  const database = await getDatabase()
  try {
    return parse(await database.get("vault", slot))
  } finally {
    database.close()
  }
}

function notify(message: "reset" | "updated") {
  if (typeof BroadcastChannel === "undefined") return
  const channel = new BroadcastChannel(channelName)
  channel.postMessage(message)
  channel.close()
}

export function subscribeToOfflineChanges(
  change: (message: "reset" | "updated") => void
) {
  if (typeof BroadcastChannel === "undefined") return () => {}
  const channel = new BroadcastChannel(channelName)
  channel.onmessage = (event) => {
    if (event.data === "reset" || event.data === "updated") change(event.data)
  }
  return () => channel.close()
}

export function subscribeToOfflineReset(reset: () => void) {
  return subscribeToOfflineChanges((message) => {
    if (message === "reset") reset()
  })
}

export async function clearOfflineVault() {
  if (typeof indexedDB === "undefined") return
  await edit(() => ({ marker: crypto.randomUUID() }))
  notify("reset")
}

export async function readOfflineVault() {
  if (typeof indexedDB === "undefined") return undefined
  return (await getState())?.snapshot
}

export async function getOfflineMarker() {
  return (await getState())?.marker
}

export async function enableOfflineVault(
  snapshot: OfflineSnapshot,
  marker: string | undefined
) {
  const next = await edit((state) =>
    state?.marker === marker
      ? { marker: crypto.randomUUID(), snapshot }
      : undefined
  )
  if (!next?.snapshot)
    throw new Error("Offline settings changed in another tab")
  notify("updated")
  return next.snapshot
}

export async function refreshOfflineVault(vault: VaultRead) {
  let cleared = false
  const updated = await edit((state) => {
    if (!state?.snapshot) return
    if (vault.ownerId !== state.snapshot.ownerId || !vault.encrypted) {
      cleared = true
      return { marker: crypto.randomUUID() }
    }
    if (
      vault.revision < state.snapshot.revision ||
      vault.checkedAt < state.snapshot.checkedAt
    )
      return
    const snapshot = toOfflineSnapshot(vault)
    return { ...state, snapshot }
  })
  if (cleared) notify("reset")
  else if (updated) notify("updated")
}
