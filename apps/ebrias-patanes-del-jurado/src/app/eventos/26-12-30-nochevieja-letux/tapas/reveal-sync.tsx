"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import type {
  RevealCountdown,
  revealAnnouncement,
} from "@/features/tapas/contest"
import styles from "./tapas.module.css"

type RevealProgress = {
  version: string
  countdown: RevealCountdown | null
  serverNow: number
  announcement?: ReturnType<typeof revealAnnouncement>
}

const labels: Record<number, string> = {
  1: "Primer puesto",
  2: "Segundo puesto",
  3: "Tercer puesto",
}

const medals = ["", "🥇 💎", "🥈", "🥉"]

export function RevealSync({
  version,
  countdown,
  serverNow,
  announcing,
}: RevealProgress & { announcing: boolean }) {
  const observedDeadline = useRef(countdown?.endsAt)
  const [award, setAward] = useState<RevealProgress["announcement"]>(null)
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
        if (update.countdown) observedDeadline.current = update.countdown.endsAt
        const activeAward =
          update.announcement?.revealedAt === observedDeadline.current
            ? update.announcement
            : null
        setAward(activeAward)
        setClock({
          countdown: update.countdown,
          serverNow: update.serverNow,
          receivedAt,
        })
        setNow(receivedAt)
        window.clearTimeout(endTimer)
        const deadline =
          activeAward?.expiresAt ??
          update.announcement?.expiresAt ??
          update.countdown?.endsAt
        if (deadline !== undefined) {
          endTimer = window.setTimeout(
            check,
            Math.max(0, deadline - update.serverNow)
          )
        }
        if (
          !pending &&
          !activeAward &&
          (update.version !== version || (announcing && !update.announcement))
        ) {
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
  }, [announcing, pending, router, version])

  useEffect(() => {
    if (!clock.countdown && !award) return
    const ticker = window.setInterval(() => setNow(performance.now()), 80)
    return () => window.clearInterval(ticker)
  }, [award, clock.countdown])

  const estimated =
    clock.serverNow + (clock.receivedAt ? now - clock.receivedAt : 0)
  if (award && estimated < award.expiresAt) {
    return (
      <div className={styles.countdownOverlay} role="status" aria-live="polite">
        <div className={styles.awardAnnouncement}>
          <span aria-hidden="true">{medals[award.place]}</span>
          <strong>{labels[award.place]}</strong>
          <ul>
            {award.tapas.map(({ id, name, authors }) => (
              <li key={id}>
                <strong>{name}</strong>
                <br />
                {authors.join(" y ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
  if (!clock.countdown) return null
  if (estimated < clock.countdown.startsAt) return null
  const seconds = Math.ceil((clock.countdown.endsAt - estimated) / 1000)
  return (
    <div className={styles.countdownOverlay} role="status" aria-live="polite">
      <strong>{labels[clock.countdown.place]}</strong>
      {seconds > 0 ? (
        <span className={styles.countdownNumber} key={seconds}>
          {seconds}
        </span>
      ) : null}
    </div>
  )
}
