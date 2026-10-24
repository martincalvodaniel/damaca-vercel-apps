/* These tokens are replaced by build-service-worker.ts after static export. */
const CACHE_PREFIX = __CACHE_PREFIX__
const CACHE_NAME = __CACHE_NAME__
const PRECACHE_ASSETS = __PRECACHE_ASSETS__

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(PRECACHE_ASSETS)
      } catch (error) {
        await caches.delete(CACHE_NAME)
        throw error
      }
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const oldCaches = (await caches.keys()).filter(
        (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME
      )
      // Keep the previous shell for tabs still running the previous build.
      await Promise.all(
        oldCaches.slice(0, -1).map((name) => caches.delete(name))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "ACTIVATE_UPDATE") void self.skipWaiting()
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const path =
        event.request.mode === "navigate" &&
        !url.pathname.split("/").pop().includes(".")
          ? `${url.pathname.replace(/\/$/, "")}/`
          : url.pathname
      const cached = await cache.match(path)
      if (cached) return cached
      // An older open tab may still request assets from the previous build.
      const previousNames = (await caches.keys())
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
        .reverse()
      for (const name of previousNames) {
        const previousCache = await caches.open(name)
        const previous = await previousCache.match(url.pathname)
        if (previous) return previous
      }
      try {
        return await fetch(event.request)
      } catch {
        if (event.request.mode === "navigate") {
          const notFound = await cache.match("/404.html")
          if (notFound)
            return new Response(await notFound.text(), {
              status: 404,
              headers: { "Content-Type": "text/html" },
            })
        }
        return Response.error()
      }
    })()
  )
})
