import { headers } from "next/headers"
import Image from "next/image"
import Link from "next/link"
import { CostumePicker } from "@/features/costumes/costume-picker"
import {
  getAddedCharacters,
  getCostumeState,
} from "@/features/costumes/reservations"
import { AccountControl } from "@/features/landing/account-control"
import { getAuth } from "@/lib/auth"
import styles from "../page.module.css"

export default async function Costumes() {
  const requestHeaders = await headers()
  const session = await Promise.resolve()
    .then(() => getAuth().api.getSession({ headers: requestHeaders }))
    .catch(() => null)
  const initial = session?.user.emailVerified
    ? await Promise.all([
        getCostumeState(session.user.id),
        getAddedCharacters(),
      ])
        .then(([choice, added]) => ({
          current: choice.current,
          blocked: choice.remaining === 0,
          added,
        }))
        .catch(() => null)
    : null

  return (
    <main className={styles.event}>
      <div className={styles.content}>
        <Link className={styles.back} href="/eventos/nochevieja-2026">
          ← Nochevieja en Letux
        </Link>
        <header className={styles.header}>
          <Image
            src="/images/sorting-hat.svg"
            alt="Sombrero Seleccionador"
            width={120}
            height={84}
            loading="eager"
          />
          <h1 className={styles.title}>Elige tu disfraz</h1>
          <p className={styles.details}>
            Una persona por personaje. Tu elección es secreta.
          </p>
        </header>
        {initial ? (
          <CostumePicker initial={initial} />
        ) : (
          <section className={styles.card}>
            {session?.user.emailVerified ? (
              <p>No se pudo cargar la elección. Recarga la página.</p>
            ) : (
              <>
                <p>Inicia sesión para elegir tu personaje.</p>
                <AccountControl
                  callbackFailed={false}
                  callbackPath="/eventos/nochevieja-2026/disfraces"
                />
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
