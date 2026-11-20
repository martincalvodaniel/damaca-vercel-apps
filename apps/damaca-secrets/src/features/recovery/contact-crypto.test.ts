import { expect, test as it } from "bun:test"
import {
  createContactRecovery,
  makeRecoveryDeviceKey,
  recoverWithContacts,
  transferContactShare,
} from "@/features/recovery/contact-crypto"
import { decryptEntries, encryptEntries } from "@/features/vault/crypto"

it("two different contacts can recover only for the intended device and request", async () => {
  const vaultKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
  const [first, second, third, receiver, unrelated] = await Promise.all([
    makeRecoveryDeviceKey(),
    makeRecoveryDeviceKey(),
    makeRecoveryDeviceKey(),
    makeRecoveryDeviceKey(),
    makeRecoveryDeviceKey(),
  ])
  const context = { ownerId: "owner", policyId: "policy" }
  const request = {
    ...context,
    requestId: "request",
    publicKey: receiver.publicKey,
  }
  const policy = await createContactRecovery(context, vaultKey, [
    { id: "first", publicKey: first.publicKey },
    { id: "second", publicKey: second.publicKey },
    { id: "third", publicKey: third.publicKey },
  ])
  const [firstApproval, secondApproval] = await Promise.all([
    transferContactShare(
      request,
      "first",
      policy.envelopes[0].share,
      first.privateKey
    ),
    transferContactShare(
      request,
      "second",
      policy.envelopes[1].share,
      second.privateKey
    ),
  ])
  const approvals = [
    { contactId: "first", share: firstApproval },
    { contactId: "second", share: secondApproval },
  ] as const

  const recovered = await recoverWithContacts(
    request,
    receiver.privateKey,
    policy.box,
    approvals
  )
  const entries = await encryptEntries(context.ownerId, vaultKey, [])
  expect(await decryptEntries(context.ownerId, recovered, entries)).toEqual([])
  expect(receiver.privateKey.extractable).toBe(false)
  await expect(
    recoverWithContacts(
      { ...request, requestId: "another" },
      receiver.privateKey,
      policy.box,
      approvals
    )
  ).rejects.toThrow()
  await expect(
    recoverWithContacts(request, unrelated.privateKey, policy.box, approvals)
  ).rejects.toThrow()
  await expect(
    recoverWithContacts(request, receiver.privateKey, policy.box, [
      approvals[0],
      approvals[0],
    ])
  ).rejects.toThrow()
  await expect(
    transferContactShare(
      request,
      "second",
      policy.envelopes[0].share,
      first.privateKey
    )
  ).rejects.toThrow()
})
