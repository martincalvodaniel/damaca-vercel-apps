/// <reference lib="webworker" />

declare const OFFLINE_BUILD_ID: string
declare const OFFLINE_ASSET_URLS: readonly string[]

const worker = self as unknown as ServiceWorkerGlobalScope
const prefix = "damaca-secrets-shell:"
const cacheName = `${prefix}${OFFLINE_BUILD_ID}`
const shell = "/offline-vault"
const assets = new Set(OFFLINE_ASSET_URLS)

async function installShell() {
  const cache = await caches.open(cacheName)
  try {
    await Promise.all(
      OFFLINE_ASSET_URLS.map(async (path) => {
        const response = await fetch(path, {
          cache: "reload",
          credentials: "same-origin",
        })
        if (
          !response.ok ||
          response.redirected ||
          new URL(response.url).pathname !== path
        ) {
          throw new Error("Offline resource unavailable")
        }
        const html = response.headers.get("content-type")?.includes("text/html")
        if (path === shell) {
          if (
            !html ||
            !(await response.clone().text()).includes(
              'data-offline-shell="damaca-secrets"'
            )
          ) {
            throw new Error("Invalid offline shell")
          }
        } else if (html) {
          throw new Error("Unexpected HTML for an offline asset")
        }
        await cache.put(path, response)
      })
    )
  } catch (error) {
    await caches.delete(cacheName)
    throw error
  }
}

worker.addEventListener("install", (event) => {
  event.waitUntil(installShell())
})

worker.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith(prefix) && key !== cacheName)
          .map((key) => caches.delete(key))
      )
      await worker.clients.claim()
    })()
  )
})

worker.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== worker.location.origin) return
  if (request.mode === "navigate" && ["/", shell].includes(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request, { signal: AbortSignal.timeout(5000) })
        } catch {
          return (
            (await (await caches.open(cacheName)).match(shell)) ??
            Response.error()
          )
        }
      })()
    )
    return
  }
  if (url.pathname !== shell && assets.has(url.pathname)) {
    event.respondWith(
      (async () => {
        const response = await (await caches.open(cacheName)).match(
          url.pathname
        )
        return response ?? fetch(request)
      })()
    )
  }
})

worker.addEventListener("message", (event) => {
  if (event.data !== "OFFLINE_READY" || !event.ports[0]) return
  event.waitUntil(
    (async () => {
      const cache = await caches.open(cacheName)
      const resources = await Promise.all(
        OFFLINE_ASSET_URLS.map((path) => cache.match(path))
      )
      event.ports[0].postMessage(resources.every(Boolean))
    })()
  )
})
