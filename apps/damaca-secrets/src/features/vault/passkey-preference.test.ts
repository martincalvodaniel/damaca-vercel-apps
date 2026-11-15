import { afterEach, expect, test as it } from "bun:test"
import {
  getRememberedPasskey,
  rememberPasskey,
} from "@/features/vault/passkey-preference"

const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  "localStorage"
)

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage)
  } else {
    Reflect.deleteProperty(globalThis, "localStorage")
  }
})

it("remembers a passkey only for its vault owner", () => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
  rememberPasskey("first-owner", "first-passkey")
  expect(getRememberedPasskey("second-owner")).toBeNull()
  rememberPasskey("second-owner", "second-passkey")
  expect(getRememberedPasskey("first-owner")).toBe("first-passkey")
  expect(getRememberedPasskey("second-owner")).toBe("second-passkey")
})

it("falls back to manual passkey unlock when storage is blocked", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Storage blocked", "SecurityError")
    },
  })
  expect(getRememberedPasskey("owner")).toBeNull()
  expect(() => rememberPasskey("owner", "passkey")).not.toThrow()
})
