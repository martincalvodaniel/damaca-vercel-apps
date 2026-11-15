"use client"

import { useRouter } from "next/navigation"
import { Fragment, useEffect, useRef, useState, useTransition } from "react"
import { MemberAvatar } from "@/features/members/member-avatar"
import type {
  publicCountdown,
  revealAnnouncement,
} from "@/features/tapas/contest"
import styles from "./tapas.module.css"

type Award = NonNullable<ReturnType<typeof revealAnnouncement>>
type AwardAuthor = Award["tapas"][number]["authors"][number] & {
  image: string | null
}
type AwardPayload = Omit<Award, "tapas"> & {
  tapas: (Omit<Award["tapas"][number], "authors"> & {
    authors: AwardAuthor[]
  })[]
}

type RevealProgress = {
  version: string
  countdown: ReturnType<typeof publicCountdown>
  serverNow: number
  announcement?: AwardPayload | null
}

const labels: Record<number, string> = {
  1: "Primer puesto",
  2: "Segundo puesto",
  3: "Tercer puesto",
}

const medals = ["", "🥇 💎", "🥈", "🥉"]

const scoreFormat = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 })

function RevealPoints({ points }: { points: number | null }) {
  return points === null ? null : (
    <span className={styles.revealPoints}>
      {scoreFormat.format(points)} / 40 puntos
    </span>
  )
}

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
          <span aria-hidden="true">
            {award.tie ? "🥇" : medals[award.place]}
          </span>
          <strong>
            {award.tie ? "¡Empate en el primer puesto!" : labels[award.place]}
          </strong>
          <RevealPoints points={award.points} />
          {award.runoffVotes !== null ? (
            <span className={styles.revealPoints}>
              {award.runoffVotes} {award.runoffVotes === 1 ? "voto" : "votos"}{" "}
              de desempate
            </span>
          ) : null}
          <ul>
            {award.tapas.map(({ id, name, authors }) => (
              <li key={id}>
                <strong>{name}</strong> (
                {authors.map((author, index) => (
                  <Fragment key={author.id}>
                    {index > 0 ? " y " : null}
                    <MemberAvatar alias={author.alias} image={author.image} />
                    {author.alias}
                  </Fragment>
                ))}
                )
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
      <RevealPoints points={clock.countdown.points} />
      {seconds > 0 ? (
        <span className={styles.countdownNumber} key={seconds}>
          {seconds}
        </span>
      ) : null}
    </div>
  )
}
