"use client"

function verifyWorker(worker: ServiceWorker) {
  return new Promise<boolean>((resolve, reject) => {
    const channel = new MessageChannel()
    const timeout = setTimeout(() => {
      channel.port1.close()
      reject(new Error("Offline worker did not respond"))
    }, 5000)
    channel.port1.onmessage = (event) => {
      clearTimeout(timeout)
      channel.port1.close()
      resolve(event.data === true)
    }
    worker.postMessage("OFFLINE_READY", [channel.port2])
  })
}

export async function prepareOfflineShell() {
  if (!("serviceWorker" in navigator))
    throw new Error("Offline browsing is unavailable")
  await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  })
  const registration = await new Promise<ServiceWorkerRegistration>(
    (resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Offline preparation timed out")),
        30000
      )
      void navigator.serviceWorker.ready.then((ready) => {
        clearTimeout(timeout)
        resolve(ready)
      })
    }
  )
  if (!registration.active || !(await verifyWorker(registration.active))) {
    throw new Error("Offline preparation is incomplete")
  }
}
