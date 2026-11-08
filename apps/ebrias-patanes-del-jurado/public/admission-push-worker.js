self.addEventListener("push", (event) => {
  if (!event.data) return
  event.waitUntil(
    self.registration.showNotification("Ebrias", {
      body: event.data.json().body,
      tag: "admission-request",
      icon: "/icons/apple-touch-icon.png",
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow("/settings"))
})
