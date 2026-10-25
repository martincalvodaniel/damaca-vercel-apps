export function createAuthenticatedWorker(cachePrefix: string): string {
  if (!/^[a-z0-9-]+-$/u.test(cachePrefix))
    throw new Error("Invalid cache prefix")
  return `/* Authenticated applications never cache protected responses. */
const CACHE_PREFIX = ${JSON.stringify(cachePrefix)}
self.addEventListener("install", (event) => {
  // Retire legacy offline shells as soon as this security migration is received.
  event.waitUntil(self.skipWaiting())
})
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith(CACHE_PREFIX)).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})
self.addEventListener("fetch", (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) return
  event.respondWith(fetch(event.request, { cache: "no-store" }))
})
self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") void self.skipWaiting()
})
`
}
