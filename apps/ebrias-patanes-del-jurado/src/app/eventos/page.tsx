import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { formatEventDate, listEvents } from "@/features/events/catalog"
import { getAuthorizedUser } from "@/lib/session"
import styles from "./page.module.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this page export.
export const metadata: Metadata = { title: "Eventos · Ebrias" }

export default async function EventsIndex() {
  if (!(await getAuthorizedUser())) redirect("/")

  const { upcoming, past } = listEvents()
  const sections = [
    {
      title: "Próximos eventos",
      events: upcoming,
      empty: "No hay próximos eventos.",
    },
    {
      title: "Eventos pasados",
      events: past,
      empty: "Todavía no hay eventos pasados.",
    },
  ]

  return (
    <main className={`landing ${styles.page}`}>
      <div className={styles.content}>
        <h1>Eventos</h1>
        {sections.map(({ title, events, empty }) => (
          <section className="settings-card" key={title}>
            <h2>{title}</h2>
            {events.length ? (
              <ul className={styles.list}>
                {events.map(({ href, title, startDate, endDate, location }) => (
                  <li key={href}>
                    <Link className={styles.event} href={href}>
                      <strong>{title}</strong>
                      <span className={styles.details}>
                        <time dateTime={startDate}>
                          {formatEventDate(startDate)}
                        </time>
                        {startDate !== endDate ? (
                          <>
                            {" "}
                            –{" "}
                            <time dateTime={endDate}>
                              {formatEventDate(endDate)}
                            </time>
                          </>
                        ) : null}
                      </span>
                      <span className={styles.details}>{location}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>{empty}</p>
            )}
          </section>
        ))}
      </div>
    </main>
  )
}
