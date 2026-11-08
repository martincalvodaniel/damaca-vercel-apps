"use client"

import { useCallback, useState } from "react"

export function AdmissionPushToggle({ publicKey }: { publicKey: string }) {
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  const enable = useCallback(async () => {
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setMessage(
        "Este navegador no admite avisos aquí. En iPhone, abre Ebrias desde el icono de la pantalla de inicio."
      )
      return
    }
    setPending(true)
    try {
      if ((await Notification.requestPermission()) !== "granted") {
        setMessage("Permite las notificaciones de Ebrias en el navegador.")
        return
      }
      await navigator.serviceWorker.register("/admission-push-worker.js")
      const registration = await navigator.serviceWorker.ready
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        }))
      const response = await fetch("/api/admission-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })
      if (!response.ok) throw new Error("Subscription could not be saved")
      setMessage("Avisos activados en este dispositivo.")
    } catch {
      setMessage("No se pudieron activar los avisos.")
    } finally {
      setPending(false)
    }
  }, [publicKey])

  return (
    <div className="account">
      <button type="button" disabled={pending} onClick={enable}>
        Activar avisos de solicitudes
      </button>
      <p role="status">{message}</p>
    </div>
  )
}
