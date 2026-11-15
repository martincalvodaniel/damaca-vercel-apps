"use client"

import { type DBSchema, openDB } from "idb"
import {
  isOfflineSnapshotUsable,
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

function resetState(state: OfflineState | undefined): OfflineState {
  return {
    marker: crypto.randomUUID(),
    ...(state?.disabled ? { disabled: true } : {}),
  }
}

export async function clearOfflineVault(expected?: { marker: string }) {
  if (typeof indexedDB === "undefined") return
  const cleared = await edit((state) =>
    !expected || state?.marker === expected.marker
      ? resetState(state)
      : undefined
  )
  if (cleared) notify("reset")
}

export async function readOfflineState() {
  return getState()
}

export async function readOfflineVault() {
  if (typeof indexedDB === "undefined") return undefined
  const state = await getState()
  return state?.disabled ? undefined : state?.snapshot
}

export async function setOfflineEnabled(enabled: boolean) {
  const updated = await edit((state) => {
    if (Boolean(state?.disabled) === !enabled) return undefined
    return {
      marker: crypto.randomUUID(),
      ...(!enabled ? { disabled: true } : {}),
    }
  })
  if (updated) notify(enabled ? "updated" : "reset")
}

export async function captureOfflineMarker() {
  const state =
    (await getState()) ??
    (await edit((current) => current ?? resetState(undefined)))
  return state?.marker
}

export async function storeOfflineVault(
  snapshot: OfflineSnapshot,
  marker: string
) {
  const updated = await edit((state) => {
    if (state?.marker !== marker || state.disabled) return
    const stored = state.snapshot
    if (stored?.ownerId === snapshot.ownerId) {
      if (stored.checkedAt > snapshot.checkedAt) return
      if (stored.revision > snapshot.revision) {
        return {
          marker,
          snapshot: {
            ...stored,
            checkedAt: snapshot.checkedAt,
            expiresAt: snapshot.expiresAt,
          },
        }
      }
    } else if (stored) {
      return
    }
    return { marker, snapshot }
  })
  if (updated) notify("updated")
  return Boolean(updated)
}

export async function markOfflinePreparationFailed(marker: string) {
  const updated = await edit((state) => {
    if (
      state?.marker !== marker ||
      state.disabled ||
      (state.snapshot && isOfflineSnapshotUsable(state.snapshot))
    )
      return
    return { ...state, preparationFailed: true }
  })
  if (updated) notify("updated")
}

export async function refreshOfflineVault(vault: VaultRead, marker: string) {
  let cleared = false
  const updated = await edit((state) => {
    if (state?.marker !== marker || state.disabled || !state.snapshot) return
    const copy = toOfflineSnapshot(vault)
    const stored = state.snapshot
    if (vault.ownerId !== stored.ownerId || !copy) {
      cleared = true
      return resetState(state)
    }
    if (copy.revision <= stored.revision || !isOfflineSnapshotUsable(stored))
      return
    return {
      ...state,
      snapshot: {
        ...copy,
        checkedAt: stored.checkedAt,
        expiresAt: stored.expiresAt,
      },
    }
  })
  if (cleared) notify("reset")
  else if (updated) notify("updated")
}
