import { afterEach, describe, expect, it } from "bun:test"
import "fake-indexeddb/auto"
import {
  clearOfflineVault,
  enableOfflineVault,
  getOfflineMarker,
  readOfflineVault,
  refreshOfflineVault,
} from "@/lib/offline/storage"
import {
  isOfflineSnapshotUsable,
  toOfflineSnapshot,
} from "@/schemas/offline-vault"
import type { VaultRead } from "@/schemas/vault"

const box = { nonce: "a".repeat(16), ciphertext: "b".repeat(64) }
const salt = "c".repeat(22)
const vault: VaultRead = {
  ownerId: "fixture",
  revision: 1,
  checkedAt: 100,
  expiresAt: 200,
  encrypted: {
    version: 1,
    entries: box,
    password: { salt, box },
    recovery: box,
    passkeys: [{ id: "fixture", salt: "d".repeat(43), box }],
  },
}
const snapshot = toOfflineSnapshot(vault)
if (!snapshot) throw new Error("Encrypted fixture required")

describe("offline vault storage", () => {
  afterEach(clearOfflineVault)

  it("keeps only a password-protected copy and refuses expired leases", async () => {
    await enableOfflineVault(snapshot, await getOfflineMarker())
    expect(await readOfflineVault()).toEqual({
      ownerId: "fixture",
      revision: 1,
      checkedAt: 100,
      expiresAt: 200,
      entries: box,
      password: { salt, box },
    })
    expect(isOfflineSnapshotUsable(snapshot, 99)).toBe(false)
    expect(isOfflineSnapshotUsable(snapshot, 100)).toBe(true)
    expect(isOfflineSnapshotUsable(snapshot, 199)).toBe(true)
    expect(isOfflineSnapshotUsable(snapshot, 200)).toBe(false)
  })

  it("prevents stale activation after cleanup and removes a previous account's copy", async () => {
    const marker = await getOfflineMarker()
    await clearOfflineVault()
    await expect(enableOfflineVault(snapshot, marker)).rejects.toThrow()
    await refreshOfflineVault(vault)
    expect(await readOfflineVault()).toBeUndefined()
    await enableOfflineVault(snapshot, await getOfflineMarker())
    await refreshOfflineVault({ ...vault, ownerId: "different-account" })
    expect(await readOfflineVault()).toBeUndefined()
  })

  it("never lets a delayed request overwrite a more recent encrypted revision", async () => {
    await enableOfflineVault(snapshot, await getOfflineMarker())
    await refreshOfflineVault({ ...vault, revision: 2, checkedAt: 110 })
    await refreshOfflineVault({ ...vault, checkedAt: 120 })
    expect(await readOfflineVault()).toMatchObject({
      revision: 2,
      checkedAt: 110,
    })
  })
})
