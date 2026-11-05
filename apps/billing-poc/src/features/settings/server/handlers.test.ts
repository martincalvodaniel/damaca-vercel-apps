import { describe, expect, test as it } from "bun:test"
import { NextResponse } from "next/server"
import type { UserPreferences } from "@/lib/domain/entities/user-preferences"
import type { UserPreferencesRepository } from "@/lib/domain/ports/user-preferences-repository"
import { createUserPreferencesHandlers } from "./handlers"

function setup() {
  const stored = new Map<string, UserPreferences>()
  let email = "Alice@Example.com"
  let denied: NextResponse | null = null
  let failWrites = false
  let reads = 0
  let writes = 0
  const repository: UserPreferencesRepository = {
    async findByUserKey(key) {
      reads++
      return stored.get(key) ?? null
    },
    async save(key, preferences) {
      writes++
      if (failWrites) throw new Error("Persistence unavailable")
      stored.set(key, { ...preferences })
    },
  }
  const handlers = createUserPreferencesHandlers({
    authorize: async () => denied,
    getEmail: async () => email || null,
    repository,
  })
  return {
    handlers,
    stored,
    setEmail: (value: string) => {
      email = value
    },
    setDenied: (status: number) => {
      denied = NextResponse.json({ error: "Denied" }, { status })
    },
    failWrites: () => {
      failWrites = true
    },
    counts: () => ({ reads, writes }),
  }
}

function request(body: unknown, query = "") {
  return new Request(`http://localhost/api/user-preferences${query}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("user preferences API", () => {
  it("defaults to Original without writing and disables shared caching", async () => {
    const { handlers, counts } = setup()
    const response = await handlers.GET()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ theme: "original" })
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
    expect(counts()).toEqual({ reads: 1, writes: 0 })
  })

  it("persists per authenticated email across new sessions and isolates users", async () => {
    const { handlers, stored, setEmail } = setup()
    const saved = await handlers.PUT(request({ theme: "olive" }))
    expect(saved.status).toBe(200)
    expect(await saved.json()).toEqual({ theme: "olive" })
    setEmail("bob@example.com")
    expect(await (await handlers.GET()).json()).toEqual({ theme: "original" })
    await handlers.PUT(request({ theme: "original" }))
    setEmail(" alice@example.COM ")
    expect(await (await handlers.GET()).json()).toEqual({ theme: "olive" })
    expect(stored.size).toBe(2)
    expect(stored.get("bob@example.com")).toEqual({ theme: "original" })
  })

  it("ignores target users supplied through query parameters", async () => {
    const { handlers, stored } = setup()
    await handlers.PUT(
      request({ theme: "olive" }, "?email=bob@example.com&userId=bob")
    )
    expect(stored.get("alice@example.com")).toEqual({ theme: "olive" })
    expect(stored.has("bob@example.com")).toBe(false)
  })

  it.each([401, 403])(
    "denies %s before reading or writing preferences",
    async (status) => {
      const { handlers, counts, setDenied } = setup()
      setDenied(status)
      expect((await handlers.GET()).status).toBe(status)
      expect((await handlers.PUT(request({ theme: "olive" }))).status).toBe(
        status
      )
      expect(counts()).toEqual({ reads: 0, writes: 0 })
    }
  )

  it("requires a session email even after authorization", async () => {
    const { handlers, counts, setEmail } = setup()
    setEmail("")
    expect((await handlers.GET()).status).toBe(401)
    expect((await handlers.PUT(request({ theme: "olive" }))).status).toBe(401)
    expect(counts()).toEqual({ reads: 0, writes: 0 })
  })

  it.each([
    {},
    { theme: "unknown" },
    { theme: null },
    { theme: "olive", email: "bob@example.com" },
    { theme: "olive", userId: "bob" },
    { theme: "olive", extra: true },
  ])("rejects invalid or identity-bearing input %j", async (body) => {
    const { handlers, counts } = setup()
    expect((await handlers.PUT(request(body))).status).toBe(400)
    expect(counts().writes).toBe(0)
  })

  it("rejects malformed JSON as a client error", async () => {
    const { handlers, counts } = setup()
    expect(
      (
        await handlers.PUT(
          new Request("http://localhost/api/user-preferences", {
            method: "PUT",
            body: "{",
          })
        )
      ).status
    ).toBe(400)
    expect(counts().writes).toBe(0)
  })

  it("reports persistence failures without claiming a saved preference", async () => {
    const { handlers, stored, failWrites } = setup()
    await handlers.PUT(request({ theme: "olive" }))
    failWrites()
    expect((await handlers.PUT(request({ theme: "original" }))).status).toBe(
      500
    )
    expect(stored.get("alice@example.com")).toEqual({ theme: "olive" })
  })

  it("reports unavailable reads instead of caching another user's data", async () => {
    const handlers = createUserPreferencesHandlers({
      authorize: async () => null,
      getEmail: async () => "alice@example.com",
      repository: {
        findByUserKey: async () => {
          throw new Error("Read unavailable")
        },
        save: async () => {},
      },
    })
    const response = await handlers.GET()
    expect(response.status).toBe(500)
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
  })
})
