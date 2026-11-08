import Image from "next/image"
import { redirect } from "next/navigation"
import { CostumePicker } from "@/features/costumes/costume-picker"
import {
  getAddedCharacters,
  getCostumeState,
} from "@/features/costumes/reservations"
import { getCostumeOwnerId } from "@/features/members/directory"
import { getAuthorizedUser } from "@/lib/session"
import styles from "../page.module.css"

export default async function Costumes() {
  const user = await getAuthorizedUser()
  if (!user) redirect("/")

  const initial = await Promise.all([
    getCostumeOwnerId(user.email, user.id).then(getCostumeState),
    getAddedCharacters(),
  ])
    .then(([choice, added]) => ({
      current: choice.current,
      blocked: choice.remaining === 0,
      added,
    }))
    .catch(() => null)

  return (
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
        </header>
        {initial ? (
          <CostumePicker initial={initial} />
        ) : (
          <section className={styles.card}>
            <p>No se pudo cargar la elección. Recarga la página.</p>
          </section>
        )}
      </div>
    </main>
  )
}
