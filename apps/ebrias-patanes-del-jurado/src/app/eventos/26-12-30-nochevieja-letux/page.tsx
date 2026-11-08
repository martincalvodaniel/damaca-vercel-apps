import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  getAttendanceBlocks,
  getEventRoster,
  letuxEvent,
  seedLetuxRoster,
} from "@/features/members/attendance"
import { getAuthorizedUser } from "@/lib/session"
import { AttendanceBlockForm, AttendanceForm } from "./attendance-form"
import { LumosGate } from "./lumos-gate"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = { title: "Nochevieja en Letux · Ebrias" }

export default async function NewYearsEve() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  await seedLetuxRoster()
  const [roster, blocks] = await Promise.all([
    getEventRoster(letuxEvent),
    getAttendanceBlocks(letuxEvent),
  ])

  return (
    <LumosGate>
      <main className={styles.event}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.crest} aria-hidden="true">
              <svg viewBox="0 0 24 32" fill="currentColor" aria-hidden="true">
                <path d="M14.5 0 4 18h6.5L8 32l12-20h-7L14.5 0Z" />
              </svg>
            </div>
            <h1 className={styles.title}>Nochevieja en Letux</h1>
            <p className={styles.date}>
              <time dateTime="2026-12-30">30 dic 2026</time> –{" "}
              <time dateTime="2027-01-01">1 ene 2027</time>
            </p>
            <p className={styles.details}>
              Casa rural en Letux · Disfraces de Harry Potter
            </p>
          </header>

          <details className={styles.attendees}>
            <summary>¿Quién viene?</summary>
            <div className={styles.roster}>
              {blocks.map(({ id: status, label }) => {
                if (status === "absent") return null
                const guests = roster.filter(
                  (member) => member.status === status
                )

                return (
                  <section key={status} className={styles.card}>
                    <h2>
                      {label} ({guests.length})
                    </h2>
                    {guests.length > 0 ? (
                      <ul>
                        {guests.map(({ id, alias }) => (
                          <li key={id}>{alias}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </details>
          {user.role === "admin" ? (
            <details className={styles.attendees}>
              <summary>Gestionar asistencia</summary>
              <div className={styles.card}>
                <AttendanceForm roster={roster} blocks={blocks} />
                <AttendanceBlockForm />
              </div>
            </details>
          ) : null}
          <Link
            className={styles.back}
            href="/eventos/26-12-30-nochevieja-letux/disfraces"
          >
            Elegir disfraz →
          </Link>
        </div>
      </main>
    </LumosGate>
  )
}
