import { combine, split } from "shamir-secret-sharing"
import {
  decodeBytes,
  encodeBytes,
  unwrapVaultFromContacts,
  wrapVaultForContacts,
} from "@/features/vault/crypto"
import type { EncryptedVault } from "@/schemas/vault"

interface RecoveryContext {
  ownerId: string
  policyId: string
}

interface Contact {
  id: string
  publicKey: string
}

interface RequestContext extends RecoveryContext {
  requestId: string
  publicKey: string
}

const algorithm = { name: "RSA-OAEP", hash: "SHA-256" }
const encoder = new TextEncoder()

export async function makeRecoveryDeviceKey() {
  const pair = await crypto.subtle.generateKey(
    {
      ...algorithm,
      modulusLength: 3072,
      publicExponent: new Uint8Array([1, 0, 1]),
    },
    false,
    ["encrypt", "decrypt"]
  )
  return {
    privateKey: pair.privateKey,
    publicKey: encodeBytes(
      new Uint8Array(await crypto.subtle.exportKey("spki", pair.publicKey))
    ),
  }
}

export async function recoveryKeyFingerprint(publicKey: string) {
  const digest = await crypto.subtle.digest("SHA-256", decodeBytes(publicKey))
  return encodeBytes(new Uint8Array(digest))
}

function shareContext(context: RecoveryContext, contactId: string) {
  return [
    "damaca-secrets",
    "contact-share-v1",
    context.ownerId,
    context.policyId,
    contactId,
  ]
}

async function seal(
  publicKey: string,
  share: Uint8Array<ArrayBuffer>,
  label: string[]
) {
  const key = await crypto.subtle.importKey(
    "spki",
    decodeBytes(publicKey),
    algorithm,
    false,
    ["encrypt"]
  )
  return encodeBytes(
    new Uint8Array(
      await crypto.subtle.encrypt(
        { name: algorithm.name, label: encoder.encode(JSON.stringify(label)) },
        key,
        share
      )
    )
  )
}

async function open(privateKey: CryptoKey, share: string, label: string[]) {
  return new Uint8Array(
    await crypto.subtle.decrypt(
      { name: algorithm.name, label: encoder.encode(JSON.stringify(label)) },
      privateKey,
      decodeBytes(share)
    )
  )
}

export async function createContactRecovery(
  context: RecoveryContext,
  key: CryptoKey,
  contacts: readonly [Contact, Contact, Contact]
) {
  if (
    new Set(contacts.map(({ id }) => id)).size !== 3 ||
    new Set(contacts.map(({ publicKey }) => publicKey)).size !== 3
  )
    throw new Error("Recovery requires three distinct contacts and device keys")

  const secret = crypto.getRandomValues(new Uint8Array(32))
  const shares: Uint8Array[] = []
  try {
    shares.push(...(await split(secret, 3, 2)))
    const box = await wrapVaultForContacts(
      context.ownerId,
      context.policyId,
      key,
      secret
    )
    const envelopes = []
    for (const [index, contact] of contacts.entries()) {
      const share = new Uint8Array(shares[index])
      try {
        envelopes.push({
          contactId: contact.id,
          share: await seal(
            contact.publicKey,
            share,
            shareContext(context, contact.id)
          ),
        })
      } finally {
        share.fill(0)
      }
    }
    return { box, envelopes }
  } finally {
    secret.fill(0)
    for (const share of shares) share.fill(0)
  }
}

async function requestLabel(context: RequestContext, contactId: string) {
  return [
    ...shareContext(context, contactId),
    context.requestId,
    await recoveryKeyFingerprint(context.publicKey),
  ]
}

export async function transferContactShare(
  context: RequestContext,
  contactId: string,
  encryptedShare: string,
  contactKey: CryptoKey
) {
  const share = await open(
    contactKey,
    encryptedShare,
    shareContext(context, contactId)
  )
  try {
    return await seal(
      context.publicKey,
      share,
      await requestLabel(context, contactId)
    )
  } finally {
    share.fill(0)
  }
}

type Approval = { contactId: string; share: string }

export async function recoverWithContacts(
  context: RequestContext,
  requestKey: CryptoKey,
  box: EncryptedVault["entries"],
  approvals: readonly [Approval, Approval]
) {
  if (
    approvals.length !== 2 ||
    approvals[0].contactId === approvals[1].contactId
  )
    throw new Error("Recovery requires two different contacts")

  const shares: Uint8Array<ArrayBuffer>[] = []
  try {
    for (const approval of approvals) {
      shares.push(
        await open(
          requestKey,
          approval.share,
          await requestLabel(context, approval.contactId)
        )
      )
    }
    const combined = await combine(shares)
    try {
      return await unwrapVaultFromContacts(
        context.ownerId,
        context.policyId,
        box,
        new Uint8Array(combined)
      )
    } finally {
      combined.fill(0)
    }
  } finally {
    for (const share of shares) share.fill(0)
  }
}
