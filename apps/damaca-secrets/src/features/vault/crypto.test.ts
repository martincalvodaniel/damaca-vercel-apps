import { describe, expect, it, spyOn } from "bun:test"
import {
  decryptEntries,
  generatePassword,
  prepareVault,
  unlockPasskey,
  unlockPassword,
  unlockRecovery,
  wrapPasskey,
} from "@/features/vault/crypto"
import { encryptedVaultSchema } from "@/schemas/vault"

const owner = "fixture-owner"
const password = "a long fixture master password"
const entries = [
  {
    id: "e7a61da3-8f22-4c76-9fe1-5ee0f85d73d9",
    title: "Private fixture title",
    username: "private username",
    password: "private password",
    url: "https://example.test/private-path",
    notes: "private notes",
  },
]

describe("vault cryptography", () => {
  it("uses authenticated ciphertext and binds the vault to its owner", async () => {
    const { encrypted, key } = await prepareVault(owner, password, entries)
    expect(encryptedVaultSchema.safeParse(encrypted).success).toBe(true)
    const wire = JSON.stringify(encrypted)
    for (const value of Object.values(entries[0]))
      expect(wire).not.toContain(value)
    expect(wire).not.toContain(password)
    const opened = await unlockPassword(owner, password, encrypted.password)
    expect(await decryptEntries(owner, opened, encrypted.entries)).toEqual(
      entries
    )
    await expect(
      unlockPassword(owner, "a different master password", encrypted.password)
    ).rejects.toThrow()
    await expect(
      decryptEntries("different-owner", key, encrypted.entries)
    ).rejects.toThrow()
    const tampered = { ...encrypted.entries, nonce: "A".repeat(16) }
    await expect(decryptEntries(owner, key, tampered)).rejects.toThrow()
  }, 15_000)

  it("recovery rotates the key and rejects a stale code or passkey", async () => {
    const first = await prepareVault(owner, password, entries)
    const recovered = await unlockRecovery(
      owner,
      first.recoveryCode,
      first.encrypted.recovery
    )
    expect(
      await decryptEntries(owner, recovered, first.encrypted.entries)
    ).toEqual(entries)
    const result = new Uint8Array(32).fill(7)
    const passkey = await wrapPasskey(
      owner,
      "fixture-key",
      "salt",
      result.slice().buffer,
      first.key
    )
    const passkeyKey = await unlockPasskey(
      owner,
      passkey,
      result.slice().buffer
    )
    expect(
      await decryptEntries(owner, passkeyKey, first.encrypted.entries)
    ).toEqual(entries)
    await expect(
      unlockPasskey(owner, passkey, new Uint8Array(32).buffer)
    ).rejects.toThrow()
    const next = await prepareVault(
      owner,
      "a new fixture master password",
      entries
    )
    expect(next.encrypted.passkeys).toEqual([])
    await expect(
      unlockRecovery(owner, first.recoveryCode, next.encrypted.recovery)
    ).rejects.toThrow()
    await expect(
      decryptEntries(owner, passkeyKey, next.encrypted.entries)
    ).rejects.toThrow()
    expect(
      await decryptEntries(owner, next.key, next.encrypted.entries)
    ).toEqual(entries)
  }, 15_000)
})

describe("password generation", () => {
  it("maps accepted random bytes into the alphabet and skips biased bytes", () => {
    using random = spyOn(crypto, "getRandomValues").mockImplementation(
      (array: unknown) => {
        if (!(array instanceof Uint8Array))
          throw new Error("Expected random bytes")
        array.fill(200)
        array[0] = 255
        return array
      }
    )
    expect(generatePassword()).toBe("+".repeat(24))
    expect(random).toHaveBeenCalledTimes(1)
  })
})
