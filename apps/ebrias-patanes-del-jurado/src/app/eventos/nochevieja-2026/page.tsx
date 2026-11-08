import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { AccountControl } from "@/features/landing/account-control"
import { getAuth } from "@/lib/auth"
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
  const requestHeaders = await headers()
  const session = await Promise.resolve()
    .then(() => getAuth().api.getSession({ headers: requestHeaders }))
    .catch(() => null)

  return (
    <main className={styles.event}>
      <div className={styles.content}>
        <Link className={styles.back} href="/">
          ← Club social
        </Link>
        <header className={styles.header}>
          <div className={styles.crest} aria-hidden="true">
            ✦
          </div>
          <p className={styles.kicker}>Convocatoria del jurado</p>
          <h1 className={styles.title}>Nochevieja en Letux</h1>
          <p className={styles.date}>
            <time dateTime="2026-12-30">30 dic 2026</time> –{" "}
            <time dateTime="2027-01-01">1 ene 2027</time>
          </p>
          <p className={styles.details}>
            Casa rural en Letux · Disfraces de Harry Potter
          </p>
        </header>

        <Link className={styles.back} href="/eventos/nochevieja-2026/disfraces">
          Elegir disfraz →
        </Link>

        {session ? (
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
        ) : (
          <section className={styles.card}>
            <h2>Lista de asistentes</h2>
            <p>Inicia sesión para ver quién viene.</p>
            <AccountControl
              callbackFailed={false}
              callbackPath="/eventos/nochevieja-2026"
            />
          </section>
        )}
      </div>
    </main>
  )
}
