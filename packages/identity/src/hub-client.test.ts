import { expect, test as it } from "bun:test"
import { checkHubAccess } from "./hub-client"

it("denies malformed identity responses and unavailable Hub over real HTTP", async () => {
  let body: object | string = {}
  let status = 200
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: () =>
      typeof body === "string"
        ? new Response(body, { status })
        : Response.json(body, { status }),
  })
  const configuration = {
    appId: "pocha-score",
    hubUrl: server.url.origin,
    clientId: "test-client",
    clientSecret: "placeholder",
  }
  try {
    expect(
      await checkHubAccess(configuration, "test-token", "player@example.com")
    ).toBe("unavailable")
    body = {
      sub: "identity",
      email: "player@example.com",
      email_verified: false,
      damaca_app_id: "pocha-score",
      damaca_access: true,
    }
    expect(
      await checkHubAccess(configuration, "test-token", "player@example.com")
    ).toBe("unavailable")
    status = 500
    body = "<h1>Unavailable</h1>"
    expect(
      await checkHubAccess(configuration, "test-token", "player@example.com")
    ).toBe("unavailable")
    status = 401
    expect(
      await checkHubAccess(configuration, "test-token", "player@example.com")
    ).toBe("denied")
  } finally {
    server.stop(true)
  }
  expect(
    await checkHubAccess(configuration, "test-token", "player@example.com")
  ).toBe("unavailable")
})
