import { expect, it, mock, spyOn } from "bun:test"
import { createHash } from "node:crypto"
import { betterAuth } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { jwt } from "better-auth/plugins"

mock.module("server-only", () => ({}))

it.each(["basic", "post"] as const)(
  "issues a resource-bound token after PKCE and consent using %s",
  async (method) => {
    const origin = `https://${method}.damaca.test`
    const issuer = `${origin}/api/auth`
    const resource = `${origin}/api/integrations/mcp`
    const callback = "https://chatgpt.com/connector/oauth/test"
    const clientId = "damaca-test"
    const secret = "test-oauth-secret"
    const env = {
      BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
      GOOGLE_CLIENT_ID: "test",
      GOOGLE_CLIENT_SECRET: "test",
      MONGODB_URI: "mongodb://localhost:27017",
      CHATGPT_CLIENT_ID: clientId,
      CHATGPT_CLIENT_SECRET: secret,
      CHATGPT_REDIRECT_URI: callback,
    }
    const previous = Object.fromEntries(
      Object.keys(env).map((key) => [key, process.env[key]])
    )
    Object.assign(process.env, env)

    try {
      const { createCaptureOAuthProvider } = await import("./chatgpt-oauth")
      const auth = betterAuth({
        baseURL: origin,
        secret: env.BETTER_AUTH_SECRET,
        database: memoryAdapter({
          user: [],
          session: [],
          account: [],
          verification: [],
          oauthClient: [],
          oauthResource: [],
          oauthConsent: [],
          oauthAccessToken: [],
          oauthRefreshToken: [],
          jwks: [],
        }),
        emailAndPassword: { enabled: true },
        plugins: [jwt({ jwt: { issuer } }), createCaptureOAuthProvider()],
      })
      const signedIn = await auth.handler(
        new Request(`${issuer}/sign-up/email`, {
          method: "POST",
          headers: { origin, "content-type": "application/json" },
          body: JSON.stringify({
            name: "Test",
            email: "owner@example.com",
            password: "test-password",
          }),
        })
      )
      expect(signedIn.status).toBe(200)
      const user = (await signedIn.json()).user
      const cookie = signedIn.headers
        .getSetCookie()
        .map((value) => value.split(";")[0])
        .join("; ")

      const verifier = "long-test-code-verifier-for-the-oauth-flow-0001"
      const authorize = new URL(`${issuer}/oauth2/authorize`)
      authorize.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callback,
        response_type: "code",
        state: "test-state",
        scope: "captures:write offline_access",
        resource,
      }).toString()

      const missingPkce = await auth.handler(
        new Request(authorize, { headers: { cookie } })
      )
      expect(missingPkce.headers.get("location")).toContain("error=")

      authorize.searchParams.set(
        "code_challenge",
        createHash("sha256").update(verifier).digest("base64url")
      )
      authorize.searchParams.set("code_challenge_method", "S256")
      const authorization = await auth.handler(
        new Request(authorize, { headers: { cookie } })
      )
      const consent = new URL(
        authorization.headers.get("location") ?? "",
        origin
      )
      expect(consent.pathname).toBe("/connect/consent")
      const decision = await auth.handler(
        new Request(`${issuer}/oauth2/consent`, {
          method: "POST",
          headers: { origin, cookie, "content-type": "application/json" },
          body: JSON.stringify({
            accept: true,
            oauth_query: consent.search.slice(1),
          }),
        })
      )
      expect(decision.status).toBe(200)
      const redirect = new URL((await decision.json()).url)
      expect(redirect.origin + redirect.pathname).toBe(callback)
      expect(redirect.searchParams.get("state")).toBe("test-state")
      const code = redirect.searchParams.get("code")
      expect(code).toBeTruthy()

      const exchange = await auth.handler(
        new Request(`${issuer}/oauth2/token`, {
          method: "POST",
          headers: {
            ...(method === "basic" && {
              authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
            }),
            "content-type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            ...(method === "post" && {
              client_id: clientId,
              client_secret: secret,
            }),
            code: code ?? "",
            redirect_uri: callback,
            code_verifier: verifier,
            resource,
          }),
        })
      )
      const tokens = await exchange.json()
      expect(tokens.error_description ?? exchange.status).toBe(200)
      expect(tokens.refresh_token).toBeTruthy()
      const claims = JSON.parse(
        Buffer.from(tokens.access_token.split(".")[1], "base64url").toString()
      )
      expect(claims).toMatchObject({
        iss: issuer,
        aud: resource,
        client_id: clientId,
        sub: user.id,
      })
      expect(claims.scope.split(" ")).toContain("captures:write")

      const { POST } = await import("../app/api/integrations/mcp/route")
      const jwks = await auth.api.getJwks()
      const fetchKeys = spyOn(globalThis, "fetch").mockImplementation(
        Object.assign(async () => Response.json(jwks), {
          preconnect: fetch.preconnect,
        })
      )
      try {
        const ping = (token: string) =>
          POST(
            new Request(resource, {
              method: "POST",
              headers: {
                authorization: `Bearer ${token}`,
                "content-type": "application/json",
                accept: "application/json, text/event-stream",
              },
              body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
            })
          )
        expect((await ping(tokens.access_token)).status).toBe(200)
        expect((await ping("invalid")).status).toBe(401)
        for (const overrides of [
          { scope: "offline_access" },
          { aud: origin },
          { client_id: "wrong-client", azp: "wrong-client" },
          { exp: 1 },
        ]) {
          const { token } = await auth.api.signJWT({
            body: { payload: { ...claims, ...overrides } },
          })
          const denied = await ping(token)
          expect(denied.status).toBe(401)
          expect(denied.headers.get("www-authenticate")).toContain(
            'scope="captures:write"'
          )
        }
      } finally {
        fetchKeys.mockRestore()
      }
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    }
  }
)
