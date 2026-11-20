import { expect, test as it } from "bun:test"
import "fake-indexeddb/auto"
import {
  createRecoveryDeviceKey,
  getRecoveryDeviceKey,
  removeRecoveryDeviceKey,
} from "./device-keys"

it("persists one private key per account and recovery slot", async () => {
  const [first, second] = await Promise.all([
    createRecoveryDeviceKey("owner", "contact", "invitation"),
    createRecoveryDeviceKey("owner", "contact", "invitation"),
  ])
  expect(first.publicKey).toBe(second.publicKey)
  const stored = await getRecoveryDeviceKey("owner", "contact", "invitation")
  expect(stored?.publicKey).toBe(first.publicKey)
  expect(stored?.privateKey.extractable).toBe(false)
  expect(
    await getRecoveryDeviceKey("other-owner", "contact", "invitation")
  ).toBeUndefined()
  expect(
    await getRecoveryDeviceKey("owner", "request", "invitation")
  ).toBeUndefined()
  await removeRecoveryDeviceKey("owner", "contact", "invitation")
  expect(
    await getRecoveryDeviceKey("owner", "contact", "invitation")
  ).toBeUndefined()
})
