"use client"

import { useEffect } from "react"

const idleDuration = 5 * 60 * 1000

export function useIdleLock(active: boolean, lock: () => void) {
  useEffect(() => {
    if (!active) return
    let deadline = Date.now() + idleDuration
    let timeout: ReturnType<typeof setTimeout>

    function check() {
      clearTimeout(timeout)
      const remaining = deadline - Date.now()
      if (remaining <= 0) lock()
      else timeout = setTimeout(check, remaining)
    }

    function activity() {
      if (Date.now() >= deadline) {
        lock()
        return
      }
      deadline = Date.now() + idleDuration
      check()
    }

    check()
    const events = ["pointerdown", "keydown", "input"]
    for (const event of events) window.addEventListener(event, activity)
    document.addEventListener("visibilitychange", check)
    window.addEventListener("pagehide", lock)
    return () => {
      clearTimeout(timeout)
      for (const event of events) window.removeEventListener(event, activity)
      document.removeEventListener("visibilitychange", check)
      window.removeEventListener("pagehide", lock)
    }
  }, [active, lock])
}
