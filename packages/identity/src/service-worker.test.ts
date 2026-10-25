import { expect, test as it } from "bun:test"
import vm from "node:vm"
import { createAuthenticatedWorker } from "./service-worker"

it("retires only its own caches and always fetches protected resources from network", async () => {
  const handlers = new Map<string, (event: unknown) => void>()
  const deleted: string[] = []
  const requests: string[] = []
  const source = createAuthenticatedWorker("pocha-score-shell-")
  vm.runInNewContext(source, {
    URL,
    caches: {
      keys: async () => [
        "pocha-score-shell-old",
        "pocha-score-shell-older",
        "card-wars-shell-old",
      ],
      delete: async (name: string) => {
        deleted.push(name)
      },
    },
    fetch: async (request: Request, options: RequestInit) => {
      expect(options.cache).toBe("no-store")
      requests.push(request.url)
      return new Response("network")
    },
    self: {
      location: { origin: "https://pocha.example.com" },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
    },
  })
  let pending = Promise.resolve()
  handlers.get("activate")?.({
    waitUntil: (operation: Promise<void>) => {
      pending = operation
    },
  })
  await pending
  expect(deleted).toEqual(["pocha-score-shell-old", "pocha-score-shell-older"])
  for (const path of [
    "/",
    "/settings",
    "/api/auth/get-session",
    "/api/access",
    "/?_rsc=payload",
  ]) {
    let result: Promise<Response> | undefined
    handlers.get("fetch")?.({
      request: new Request(`https://pocha.example.com${path}`),
      respondWith: (response: Promise<Response>) => {
        result = response
      },
    })
    expect(await (await result)?.text()).toBe("network")
  }
  expect(requests).toHaveLength(5)
})
