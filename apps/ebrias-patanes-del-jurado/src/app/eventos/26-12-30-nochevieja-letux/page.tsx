import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  getAttendanceBlocks,
  getEventRoster,
  letuxEvent,
} from "@/features/members/attendance"
import { getMemberDirectory } from "@/features/members/directory"
import { getCarBoard, unassignedCar } from "@/features/members/event-cars"
import { canManageAttendance, getAuthorizedUser } from "@/lib/session"
import { AttendanceBoard } from "./attendance-form"
import { LumosGate } from "./lumos-gate"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = { title: "Nochevieja en Letux · Ebrias" }

export default async function NewYearsEve() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const [roster, blocks, cars] = await Promise.all([
    getEventRoster(letuxEvent),
    getAttendanceBlocks(letuxEvent),
    getCarBoard(letuxEvent),
  ])

  const canManage = await canManageAttendance()
  const members = canManage ? await getMemberDirectory() : []

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
            <AttendanceBoard
              blocks={blocks}
              roster={roster}
              members={members}
              canManage={canManage}
            />
          </details>
          <details className={styles.attendees}>
            <summary>Reparto de coches</summary>
            <AttendanceBoard
              mode="cars"
              blocks={cars.blocks}
              roster={roster.map((guest) => ({
                ...guest,
                status: cars.assigned.get(guest.id) ?? unassignedCar,
              }))}
              members={[]}
              canManage={canManage}
            />
          </details>
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
