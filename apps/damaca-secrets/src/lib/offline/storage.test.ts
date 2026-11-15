import { afterEach, describe, expect, it } from "bun:test"
import "fake-indexeddb/auto"
import {
  captureOfflineMarker,
  clearOfflineVault,
  markOfflinePreparationFailed,
  readOfflineState,
  readOfflineVault,
  refreshOfflineVault,
  setOfflineEnabled,
  storeOfflineVault,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  toOfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultRead } from "@/schemas/vault"

const box = { nonce: "a".repeat(16), ciphertext: "b".repeat(64) }
const salt = "c".repeat(22)
const checkedAt = Date.now() - 1000
const expiresAt = checkedAt + 86_400_000
const vault: VaultRead = {
  ownerId: "fixture",
  revision: 1,
  checkedAt,
  expiresAt,
  encrypted: {
    version: 1,
    entries: box,
    password: { salt, box },
    recovery: box,
    passkeys: [{ id: "fixture", salt: "d".repeat(43), box }],
  },
}
const encrypted = vault.encrypted
const snapshot = toOfflineSnapshot(vault)
if (!snapshot || !encrypted) throw new Error("Encrypted fixture required")

async function captureMarker() {
  const marker = await captureOfflineMarker()
  if (!marker) throw new Error("Offline marker required")
  return marker
}

describe("offline vault storage", () => {
  afterEach(async () => {
    await setOfflineEnabled(true)
    await clearOfflineVault()
  })

  it("keeps only a password-protected copy and refuses expired leases", async () => {
    expect(await storeOfflineVault(snapshot, await captureMarker())).toBe(true)
    expect(await readOfflineVault()).toEqual({
      ownerId: "fixture",
      revision: 1,
      checkedAt,
      expiresAt,
      entries: box,
      password: { salt, box },
    })
    expect(isOfflineSnapshotUsable(snapshot, checkedAt - 1)).toBe(false)
    expect(isOfflineSnapshotUsable(snapshot, checkedAt)).toBe(true)
    expect(isOfflineSnapshotUsable(snapshot, expiresAt - 1)).toBe(true)
    expect(isOfflineSnapshotUsable(snapshot, expiresAt)).toBe(false)
  })

  it("keeps the browser opt-out after cleanup and rejects delayed preparation", async () => {
    const marker = await captureMarker()
    await storeOfflineVault(snapshot, marker)
    await setOfflineEnabled(false)
    await clearOfflineVault()
    expect((await readOfflineState())?.disabled).toBe(true)
    expect(await readOfflineVault()).toBeUndefined()
    expect(await storeOfflineVault(snapshot, marker)).toBe(false)
    expect(await storeOfflineVault(snapshot, await captureMarker())).toBe(false)
    await setOfflineEnabled(true)
    expect(await readOfflineVault()).toBeUndefined()
    expect(await storeOfflineVault(snapshot, marker)).toBe(false)
    expect(await storeOfflineVault(snapshot, await captureMarker())).toBe(true)
  })

  it("rejects work captured before account cleanup and clears a different owner's copy", async () => {
    const oldMarker = await captureMarker()
    await storeOfflineVault(snapshot, oldMarker)
    await clearOfflineVault()
    expect(await storeOfflineVault(snapshot, oldMarker)).toBe(false)

    const marker = await captureMarker()
    await storeOfflineVault(snapshot, marker)
    await clearOfflineVault({ marker: oldMarker })
    expect(await readOfflineVault()).toEqual(snapshot)
    await refreshOfflineVault(
      { ...vault, ownerId: "different-account" },
      marker
    )
    expect(await readOfflineVault()).toBeUndefined()
    expect(await storeOfflineVault(snapshot, marker)).toBe(false)
  })

  it("refreshes the payload after edits without renewing or overwriting a newer revision", async () => {
    const marker = await captureMarker()
    await storeOfflineVault(snapshot, marker)
    const changedEntries = { ...box, ciphertext: "e".repeat(64) }
    await refreshOfflineVault(
      {
        ...vault,
        revision: 2,
        checkedAt: checkedAt + 100,
        expiresAt: expiresAt + 100,
        encrypted: { ...encrypted, entries: changedEntries },
      },
      marker
    )
    await refreshOfflineVault({ ...vault, checkedAt: checkedAt + 200 }, marker)
    expect(await readOfflineVault()).toMatchObject({
      revision: 2,
      entries: changedEntries,
      checkedAt,
      expiresAt,
    })
    await storeOfflineVault(
      { ...snapshot, checkedAt: checkedAt + 300, expiresAt: expiresAt + 300 },
      marker
    )
    expect(await readOfflineVault()).toMatchObject({
      revision: 2,
      entries: changedEntries,
      checkedAt: checkedAt + 300,
      expiresAt: expiresAt + 300,
    })
  })

  it("never renews an expired copy through an online read or save", async () => {
    const marker = await captureMarker()
    const expired = {
      ...snapshot,
      checkedAt: checkedAt - 86_400_000,
      expiresAt: checkedAt,
    }
    await storeOfflineVault(expired, marker)
    await refreshOfflineVault({ ...vault, revision: 2 }, marker)
    expect(await readOfflineVault()).toEqual(expired)
    await markOfflinePreparationFailed(marker)
    expect((await readOfflineState())?.preparationFailed).toBe(true)
    await storeOfflineVault({ ...snapshot, revision: 2 }, marker)
    expect((await readOfflineState())?.preparationFailed).toBeUndefined()
  })
})
