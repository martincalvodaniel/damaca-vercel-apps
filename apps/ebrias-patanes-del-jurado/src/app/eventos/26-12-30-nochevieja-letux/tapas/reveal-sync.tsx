"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { RevealCountdown } from "@/features/tapas/contest"
import styles from "./tapas.module.css"

type RevealProgress = {
  version: string
  countdown: RevealCountdown | null
  serverNow: number
}

const labels: Record<number, string> = {
  1: "Primer puesto",
  2: "Segundo puesto",
  3: "Tercer puesto",
}

export function RevealSync({ version, countdown, serverNow }: RevealProgress) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [clock, setClock] = useState({ countdown, serverNow, receivedAt: 0 })
  const [now, setNow] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let checking = false
    let endTimer: number | undefined
    async function check() {
      if (document.hidden || checking || controller.signal.aborted) return
      checking = true
      try {
        const response = await fetch("/api/tapas-reveal", {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return
        const update: RevealProgress = await response.json()
        if (controller.signal.aborted) return
        const receivedAt = performance.now()
        setClock({
          countdown: update.countdown,
          serverNow: update.serverNow,
          receivedAt,
        })
        setNow(receivedAt)
        window.clearTimeout(endTimer)
        if (update.countdown) {
          endTimer = window.setTimeout(
            check,
            Math.max(0, update.countdown.endsAt - update.serverNow)
          )
        }
        if (!pending && update.version !== version) {
          startTransition(() => router.refresh())
        }
      } catch {
        // Retry on the next interval.
      } finally {
        checking = false
      }
    }

    void check()
    const timer = window.setInterval(check, 2000)
    document.addEventListener("visibilitychange", check)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.clearTimeout(endTimer)
      document.removeEventListener("visibilitychange", check)
    }
  }, [pending, router, version])

  useEffect(() => {
    if (!clock.countdown) return
    const ticker = window.setInterval(() => setNow(performance.now()), 80)
    return () => window.clearInterval(ticker)
  }, [clock.countdown])

  if (!clock.countdown) return null
  const estimated =
    clock.serverNow + (clock.receivedAt ? now - clock.receivedAt : 0)
  if (
    estimated < clock.countdown.startsAt ||
    estimated >= clock.countdown.endsAt
  )
    return null
  const seconds = Math.ceil((clock.countdown.endsAt - estimated) / 1000)
  return (
    <div className={styles.countdownOverlay} role="status" aria-live="polite">
      <strong>{labels[clock.countdown.place]}</strong>
      <span className={styles.countdownNumber} key={seconds}>
        {seconds}
      </span>
    </div>
  )
}
