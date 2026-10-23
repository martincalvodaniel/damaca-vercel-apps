import { expect, it } from "bun:test"
import { readFile } from "node:fs/promises"
import { runInNewContext } from "node:vm"

async function workerHarness() {
  const handlers = new Map<string, (event: unknown) => void>()
  const entries = new Map<string, Response>([
    ["/", new Response("Home")],
    ["/settings/", new Response("Settings")],
    ["/404.html", new Response("Not found")],
  ])
  const previousEntries = new Map([
    ["/previous-chunk.js", new Response("Previous chunk")],
  ])
  const deleted: string[] = []
  let failInstall = false
  let skipWaiting = false
  let requested: unknown
  const cache = {
    match: async (path: string) => entries.get(path)?.clone(),
    addAll: async (assets: unknown) => {
      requested = assets
      if (failInstall) throw new Error("Network unavailable")
    },
  }
  const source = (await readFile("scripts/service-worker.js", "utf8"))
    .replace("__CACHE_PREFIX__", '"test-shell-"')
    .replace("__CACHE_NAME__", '"test-shell-current"')
    .replace("__PRECACHE_ASSETS__", '["/", "/settings/"]')
  runInNewContext(source, {
    URL,
    Response,
    self: {
      location: { origin: "https://local.example" },
      clients: { claim: async () => {} },
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
      skipWaiting: () => {
        skipWaiting = true
      },
    },
    caches: {
      open: async (name: string) =>
        name === "test-shell-previous"
          ? {
              match: async (path: string) => previousEntries.get(path)?.clone(),
            }
          : cache,
      keys: async () => [
        "unrelated",
        "test-shell-oldest",
        "test-shell-previous",
        "test-shell-current",
      ],
      delete: async (name: string) => {
        deleted.push(name)
      },
      match: async () => undefined,
    },
    fetch: async () => {
      throw new Error("Offline")
    },
  })
  async function lifecycle(name: string) {
    let work: Promise<unknown> | undefined
    handlers.get(name)?.({
      waitUntil: (promise: Promise<unknown>) => {
        work = promise
      },
    })
    await work
  }
  async function navigate(path: string) {
    let result: Promise<Response> | undefined
    handlers.get("fetch")?.({
      request: {
        url: `https://local.example${path}`,
        method: "GET",
        mode: "navigate",
      },
      respondWith: (promise: Promise<Response>) => {
        result = promise
      },
    })
    return result
  }
  return {
    handlers,
    deleted,
    lifecycle,
    navigate,
    fail: () => {
      failInstall = true
    },
    requested: () => requested,
    skipped: () => skipWaiting,
  }
}

it("serves both routes offline, normalizes navigation, and returns 404 for unknown routes", async () => {
  const worker = await workerHarness()
  expect(await (await worker.navigate("/"))?.text()).toBe("Home")
  expect(await (await worker.navigate("/settings?example=1"))?.text()).toBe(
    "Settings"
  )
  expect((await worker.navigate("/missing/"))?.status).toBe(404)
})

it("precaches atomically and never forces an update during installation", async () => {
  const worker = await workerHarness()
  await worker.lifecycle("install")
  expect(worker.requested()).toEqual(["/", "/settings/"])
  expect(worker.skipped()).toBe(false)
  worker.fail()
  await expect(worker.lifecycle("install")).rejects.toThrow(
    "Network unavailable"
  )
  expect(worker.deleted).toEqual(["test-shell-current"])
})

it("keeps unrelated caches and the previous build; activation requires the explicit update message", async () => {
  const worker = await workerHarness()
  await worker.lifecycle("activate")
  expect(worker.deleted).toEqual(["test-shell-oldest"])
  worker.handlers.get("message")?.({ data: { type: "OTHER" } })
  expect(worker.skipped()).toBe(false)
  worker.handlers.get("message")?.({ data: { type: "ACTIVATE_UPDATE" } })
  expect(worker.skipped()).toBe(true)
})

it("does not intercept external requests or mutations", async () => {
  const worker = await workerHarness()
  for (const request of [
    { url: "https://external.example/", method: "GET" },
    { url: "https://local.example/", method: "POST" },
  ]) {
    let intercepted = false
    worker.handlers.get("fetch")?.({
      request,
      respondWith: () => {
        intercepted = true
      },
    })
    expect(intercepted).toBe(false)
  }
})

it("serves a previous build asset only from app-owned caches", async () => {
  const worker = await workerHarness()
  expect(await (await worker.navigate("/previous-chunk.js"))?.text()).toBe(
    "Previous chunk"
  )
})
