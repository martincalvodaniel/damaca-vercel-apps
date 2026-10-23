"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { isProduction } from "@/config/runtime"
import { type InstallPromptEvent, PwaContext } from "@/lib/pwa/context"

export function PwaProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<
    "preparing" | "ready" | "error" | "unsupported" | "development"
  >("preparing")
  const [installed, setInstalled] = useState(false)
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)
  const reloadOnChange = useRef(false)

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)")
    function detectInstallation() {
      setInstalled(
        displayMode.matches ||
          (navigator as Navigator & { standalone?: boolean }).standalone ===
            true
      )
    }
    function onPrompt(event: Event) {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    function onInstalled() {
      setInstalled(true)
      setPrompt(null)
    }
    function onControllerChange() {
      setStatus("ready")
      if (reloadOnChange.current) window.location.reload()
    }
    detectInstallation()
    displayMode.addEventListener("change", detectInstallation)
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    let disposed = false
    let registration: ServiceWorkerRegistration | undefined
    const observed = new Set<ServiceWorker>()
    function observeWorker(worker: ServiceWorker) {
      if (observed.has(worker)) return
      observed.add(worker)
      worker.addEventListener("statechange", onWorkerState)
    }
    function onWorkerState(event: Event) {
      const worker = event.target as ServiceWorker
      if (worker.state === "installed") {
        if (navigator.serviceWorker.controller) setWaiting(worker)
      }
      if (worker.state === "redundant") setStatus("error")
    }
    function onUpdateFound() {
      if (registration?.installing) observeWorker(registration.installing)
    }
    function checkForUpdate() {
      if (document.visibilityState === "visible")
        void registration?.update().catch(() => {})
    }
    if (!isProduction) setStatus("development")
    else if (!("serviceWorker" in navigator) || !window.isSecureContext)
      setStatus("unsupported")
    else {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onControllerChange
      )
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then(async (result) => {
          if (disposed) return
          registration = result
          if (result.waiting) setWaiting(result.waiting)
          if (result.installing) observeWorker(result.installing)
          result.addEventListener("updatefound", onUpdateFound)
          document.addEventListener("visibilitychange", checkForUpdate)
          await navigator.serviceWorker.ready
          if (!disposed) setStatus("ready")
        })
        .catch(() => {
          if (!disposed) setStatus("error")
        })
    }
    return () => {
      disposed = true
      displayMode.removeEventListener("change", detectInstallation)
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      if ("serviceWorker" in navigator)
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          onControllerChange
        )
      registration?.removeEventListener("updatefound", onUpdateFound)
      for (const worker of observed)
        worker.removeEventListener("statechange", onWorkerState)
      document.removeEventListener("visibilitychange", checkForUpdate)
    }
  }, [])

  async function install() {
    if (!prompt) return
    try {
      await prompt.prompt()
      await prompt.userChoice
    } finally {
      setPrompt(null)
    }
  }
  function update() {
    if (!waiting) return
    reloadOnChange.current = true
    waiting.postMessage({ type: "ACTIVATE_UPDATE" })
  }

  return (
    <PwaContext
      value={{
        status,
        installed,
        canInstall: prompt !== null,
        updateAvailable: waiting !== null,
        install,
        update,
      }}
    >
      {children}
    </PwaContext>
  )
}
