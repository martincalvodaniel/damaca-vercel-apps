import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CharacterCreationControl } from "@/features/costumes/character-creation-control"
import { CostumePicker } from "@/features/costumes/costume-picker"
import {
  getAddedCharacters,
  getCharacterCreationEnabled,
  getCostumeOwnerId,
  getCostumeReservationCount,
  getCostumeState,
} from "@/features/costumes/reservations"
import { getAuthorizedUser } from "@/lib/session"
import { EventMusicControl } from "../event-music"
import styles from "../page.module.css"

export default async function Costumes() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const [initial, reservationCount, allowAdd] = await Promise.all([
    Promise.all([
      getCostumeOwnerId(user.email, user.id).then(getCostumeState),
      getAddedCharacters(),
    ])
      .then(([choice, added]) => ({
        current: choice.current,
        blocked: choice.remaining === 0,
        added,
      }))
      .catch(() => null),
    getCostumeReservationCount(),
    getCharacterCreationEnabled(),
  ])

  return (
    <>
      <main className={styles.event}>
        <div className={styles.content}>
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
            <p className={styles.details}>
              {reservationCount}{" "}
              {reservationCount === 1
                ? "asistente reservó"
                : "asistentes reservaron"}{" "}
              ya su personaje.
            </p>
          </header>
          <div className={styles.eventActions}>
            <Link
              className={styles.back}
              href="/eventos/26-12-30-nochevieja-letux"
            >
              ← Nochevieja en Letux
            </Link>
            {initial ? (
              <>
                {user.role === "admin" ? (
                  <CharacterCreationControl enabled={allowAdd} />
                ) : null}
                <CostumePicker initial={{ ...initial, allowAdd }} />
              </>
            ) : (
              <section className={styles.card}>
                <p>No se pudo cargar la elección. Recarga la página.</p>
              </section>
            )}
          </div>
        </div>
      </main>
      <EventMusicControl />
    </>
  )
}
