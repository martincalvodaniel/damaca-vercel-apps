import { expect, test as it } from "bun:test"
import { safeCallback } from "./contract"
import { validateServiceUrl } from "./hub-client"
import { oidcClientsSchema } from "./registry"

it("limits service origins to HTTPS and loopback HTTP", () => {
  for (const url of [
    "https://hub.example.com",
    "http://localhost:3005",
    "http://127.0.0.1:3005",
  ])
    expect(validateServiceUrl(url).origin).toBe(url)
  for (const url of [
    "http://hub.example.com",
    "https://hub.example.com/path",
    "https://hub.example.com?x=1",
    "https://user:secret@hub.example.com",
    "javascript:alert(1)",
  ])
    expect(() => validateServiceUrl(url)).toThrow()
})

it("rejects unsafe redirects and loops into auth handlers", () => {
  expect(safeCallback("/settings?tab=theme")).toBe("/settings?tab=theme")
  for (const value of [
    undefined,
    ["/"],
    "//attacker.invalid",
    "/\\attacker.invalid",
    "/ /attacker.invalid",
    "https://attacker.invalid",
    "/auth/access",
    "/api/auth",
    "/a/../auth/access",
  ])
    expect(safeCallback(value)).toBe("/")
})

it("requires isolated clients and exact callback registration", () => {
  const first = {
    appId: "pocha-score",
    clientId: "pocha-score-local",
    clientSecret: "a".repeat(32),
    redirectUri: "http://localhost:3003/api/auth/callback/damaca-hub",
  }
  const second = {
    appId: "card-wars",
    clientId: "card-wars-local",
    clientSecret: "b".repeat(32),
    redirectUri: "http://localhost:3004/api/auth/callback/damaca-hub",
  }
  expect(oidcClientsSchema.safeParse([first, second]).success).toBe(true)
  for (const key of ["clientId", "clientSecret", "redirectUri"] as const)
    expect(
      oidcClientsSchema.safeParse([first, { ...second, [key]: first[key] }])
        .success
    ).toBe(false)
  for (const redirectUri of [
    "https://app.example.com/*",
    "https://app.example.com/api/auth/callback/damaca-hub?redirect=elsewhere",
    "http://app.example.com/api/auth/callback/damaca-hub",
  ])
    expect(
      oidcClientsSchema.safeParse([{ ...first, redirectUri }]).success
    ).toBe(false)
})
