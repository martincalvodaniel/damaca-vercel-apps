import {
  type EncryptedVault,
  entriesSchema,
  masterPasswordSchema,
  type VaultEntry,
} from "@/schemas/vault"

type Box = EncryptedVault["entries"]
type PasswordKey = EncryptedVault["password"]
type Passkey = EncryptedVault["passkeys"][number]

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8", { fatal: true })
const recoveryFormat = /^[A-Za-z0-9_-]{43}$/u

export function encodeBytes(bytes: Uint8Array) {
  let binary = ""
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  }
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "")
}

export function decodeBytes(value: string) {
  return Uint8Array.from(
    atob(value.replaceAll("-", "+").replaceAll("_", "/")),
    (char) => char.charCodeAt(0)
  )
}

function randomBytes(length: number) {
  return crypto.getRandomValues(new Uint8Array(length))
}

function context(ownerId: string, purpose: string) {
  return encoder.encode(JSON.stringify(["damaca-secrets", 1, ownerId, purpose]))
}

async function importKey(bytes: Uint8Array<ArrayBuffer>, extractable = false) {
  try {
    return await crypto.subtle.importKey("raw", bytes, "AES-GCM", extractable, [
      "encrypt",
      "decrypt",
    ])
  } finally {
    bytes.fill(0)
  }
}

async function encrypt(
  key: CryptoKey,
  plaintext: Uint8Array<ArrayBuffer>,
  additionalData: Uint8Array<ArrayBuffer>
): Promise<Box> {
  const nonce = randomBytes(12)
  try {
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce, additionalData },
      key,
      plaintext
    )
    return {
      nonce: encodeBytes(nonce),
      ciphertext: encodeBytes(new Uint8Array(ciphertext)),
    }
  } finally {
    plaintext.fill(0)
  }
}

async function decrypt(
  key: CryptoKey,
  box: Box,
  additionalData: Uint8Array<ArrayBuffer>
) {
  return new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decodeBytes(box.nonce), additionalData },
      key,
      decodeBytes(box.ciphertext)
    )
  )
}

async function wrap(
  ownerId: string,
  purpose: string,
  key: CryptoKey,
  wrappingKey: CryptoKey
) {
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", key))
  return encrypt(wrappingKey, raw, context(ownerId, purpose))
}

async function unwrap(
  ownerId: string,
  purpose: string,
  box: Box,
  wrappingKey: CryptoKey
) {
  return importKey(
    await decrypt(wrappingKey, box, context(ownerId, purpose)),
    true
  )
}

async function passwordWrappingKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>
) {
  const { argon2idAsync } = await import("@noble/hashes/argon2.js")
  const bytes = encoder.encode(password)
  try {
    return await importKey(
      await argon2idAsync(bytes, salt, {
        m: 65536,
        t: 3,
        p: 4,
        dkLen: 32,
      })
    )
  } finally {
    bytes.fill(0)
  }
}

async function passwordBox(
  ownerId: string,
  key: CryptoKey,
  password: string
): Promise<PasswordKey> {
  const salt = randomBytes(16)
  const wrappingKey = await passwordWrappingKey(password, salt)
  return {
    salt: encodeBytes(salt),
    box: await wrap(ownerId, "password", key, wrappingKey),
  }
}

export function unlockPassword(
  ownerId: string,
  password: string,
  wrapped: PasswordKey
) {
  return passwordWrappingKey(
    masterPasswordSchema.parse(password),
    decodeBytes(wrapped.salt)
  ).then((key) => unwrap(ownerId, "password", wrapped.box, key))
}

export async function unlockRecovery(
  ownerId: string,
  code: string,
  wrapped: Box
) {
  const normalized = code.trim()
  if (!recoveryFormat.test(normalized)) throw new Error("Invalid recovery code")
  return unwrap(
    ownerId,
    "recovery",
    wrapped,
    await importKey(decodeBytes(normalized))
  )
}

async function passkeyWrappingKey(
  ownerId: string,
  id: string,
  result: ArrayBuffer
) {
  const seed = new Uint8Array(result)
  try {
    const material = await crypto.subtle.importKey("raw", seed, "HKDF", false, [
      "deriveKey",
    ])
    return await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(32),
        info: context(ownerId, `passkey:${id}`),
      },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    )
  } finally {
    seed.fill(0)
  }
}

export async function wrapPasskey(
  ownerId: string,
  id: string,
  salt: string,
  result: ArrayBuffer,
  key: CryptoKey
): Promise<Passkey> {
  const wrappingKey = await passkeyWrappingKey(ownerId, id, result)
  return {
    id,
    salt,
    box: await wrap(ownerId, `passkey:${id}`, key, wrappingKey),
  }
}

export async function unlockPasskey(
  ownerId: string,
  passkey: Passkey,
  result: ArrayBuffer
) {
  const wrappingKey = await passkeyWrappingKey(ownerId, passkey.id, result)
  return unwrap(ownerId, `passkey:${passkey.id}`, passkey.box, wrappingKey)
}

export function encryptEntries(
  ownerId: string,
  key: CryptoKey,
  entries: VaultEntry[]
) {
  return encrypt(
    key,
    encoder.encode(JSON.stringify(entries)),
    context(ownerId, "entries")
  )
}

export async function decryptEntries(
  ownerId: string,
  key: CryptoKey,
  box: Box
) {
  const plaintext = await decrypt(key, box, context(ownerId, "entries"))
  try {
    return entriesSchema.parse(JSON.parse(decoder.decode(plaintext)))
  } finally {
    plaintext.fill(0)
  }
}

export async function prepareVault(
  ownerId: string,
  password: string,
  entries: VaultEntry[]
) {
  masterPasswordSchema.parse(password)
  const key = await importKey(randomBytes(32), true)
  const recoveryBytes = randomBytes(32)
  const recoveryCode = encodeBytes(recoveryBytes)
  const recoveryKey = await importKey(recoveryBytes)
  const [passwordWrapper, recovery, encryptedEntries] = await Promise.all([
    passwordBox(ownerId, key, password),
    wrap(ownerId, "recovery", key, recoveryKey),
    encryptEntries(ownerId, key, entries),
  ])
  const encrypted: EncryptedVault = {
    version: 1,
    entries: encryptedEntries,
    password: passwordWrapper,
    recovery,
    passkeys: [],
  }
  return { key, encrypted, recoveryCode }
}

export function generatePassword() {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-=?"
  const cutoff = 256 - (256 % alphabet.length)
  let value = ""
  while (value.length < 24) {
    for (const byte of randomBytes(32)) {
      if (byte >= cutoff) continue
      value += alphabet[byte % alphabet.length]
      if (value.length === 24) return value
    }
  }
  return value
}
