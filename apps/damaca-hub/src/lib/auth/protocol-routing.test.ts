import { expect, test as it } from "bun:test"
import { config } from "../../../vercel"

it("keeps browser geography restrictions while allowing authenticated OIDC server calls", () => {
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
  ])
    expect(restricted.test(path)).toBe(true)
  for (const path of [
    "/api/auth/oauth2/token",
    "/api/auth/oauth2/userinfo",
    "/api/auth/jwks",
    "/api/auth/.well-known/openid-configuration",
  ])
    expect(restricted.test(path)).toBe(false)
})
