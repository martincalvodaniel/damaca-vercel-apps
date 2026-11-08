import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthorizedUser } from "@/lib/session"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = { title: "Nochevieja en Letux · Ebrias" }

const overnightGuests = [
  "Álvaro",
  "Víctor",
  "Dani",
  "Pali",
  "Borja",
  "Andrea",
  "Ángela",
  "Sergio",
  "Pat",
  "Adri",
  "Lis",
  "Pit",
]
const dayGuests = ["Lu", "La", "Ma", "Bebé2"]

export default async function NewYearsEve() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  return (
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
            <section className={styles.card}>
              <h2>Estancia</h2>
              <ul>
                {overnightGuests.map((name) => (
                  <li key={name}>{name}</li>
                ))}
                <li>
                  Diana <span className={styles.pending}>Pendiente</span>
                </li>
              </ul>
            </section>
            <section className={styles.card}>
              <h2>Comida y día del 31</h2>
              <ul>
                {dayGuests.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </section>
          </div>
        </details>
        <Link
          className={styles.back}
          href="/eventos/26-12-30-nochevieja-letux/disfraces"
        >
          Elegir disfraz →
        </Link>
      </div>
    </main>
  )
}
