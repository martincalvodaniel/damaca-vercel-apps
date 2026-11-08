import { expect, test as it } from "bun:test"
import { config } from "../../../vercel"

it("applies geography restrictions to browser and OIDC server routes", () => {
  const route = config.routes?.[0]
  if (!route || !("src" in route)) throw new Error("Missing geography rule")
  const restricted = new RegExp(`^${route.src}$`, "u")
  for (const path of [
    "/",
    "/admin",
    "/api/auth/sign-in/social",
    "/api/auth/callback/google",
    "/api/auth/oauth2/authorize",
    "/api/auth/oauth2/userinfo-unsafe",
    "/api/auth/oauth2/token",
    "/api/auth/oauth2/userinfo",
    "/api/auth/oauth2/introspect",
    "/api/auth/oauth2/revoke",
    "/api/auth/jwks",
    "/api/auth/.well-known/openid-configuration",
    "/api/auth/.well-known/oauth-authorization-server",
  ])
    expect(restricted.test(path)).toBe(true)
})
