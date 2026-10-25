import { describe, expect, it } from "bun:test"
import { oidcClientMutationSchema, oidcRedirectUriSchema } from "./oidc"

describe("managed OIDC client contracts", () => {
  it("accepts exact callbacks for both managed environments", () => {
    for (const environment of ["production", "int"]) {
      expect(
        oidcClientMutationSchema.safeParse({
          appId: "dalis-tasks-events",
          environment,
          operation: "create",
          redirectUri: `https://${environment}.example.com/api/auth/callback/damaca-hub`,
          revision: "0",
        }).success
      ).toBe(true)
    }
  })

  it("rejects wildcard, mismatched path, credentials, and non-HTTPS remote callbacks", () => {
    for (const redirectUri of [
      "https://*.example.com/api/auth/callback/damaca-hub",
      "https://example.com/other",
      "https://user:pass@example.com/api/auth/callback/damaca-hub",
      "http://example.com/api/auth/callback/damaca-hub",
      "https://example.com/api/auth/callback/damaca-hub?next=/",
    ]) {
      expect(oidcRedirectUriSchema.safeParse(redirectUri).success).toBe(false)
    }
    expect(
      oidcRedirectUriSchema.safeParse(
        "http://localhost:3003/api/auth/callback/damaca-hub"
      ).success
    ).toBe(true)
  })

  it("requires a known client for every operation except create", () => {
    expect(
      oidcClientMutationSchema.safeParse({
        appId: "dalis-tasks-events",
        environment: "int",
        operation: "disable",
        revision: 1,
      }).success
    ).toBe(false)
  })
})
