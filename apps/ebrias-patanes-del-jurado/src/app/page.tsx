import Image from "next/image"
import { AccountControl } from "@/features/landing/account-control"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const { error } = await searchParams

  return (
    <main className="landing">
      <header className="masthead">
        <span>Club de quedadas</span>
        <span>El jurado se reúne</span>
      </header>

      <section className="hero">
        <div className="intro">
          <p className="eyebrow">Acta nº 01 · Se abre la sesión</p>
          <h1>
            Ebrias <em>Patanes</em> del Jurado
          </h1>
          <p className="lede">El punto de encuentro para la próxima quedada.</p>
          <AccountControl callbackFailed={Boolean(error)} />
        </div>

        <div className="poster" aria-hidden="true">
          <div className="poster-caption">Convocatoria oficial</div>
          <Image
            src="/icons/emblem.svg"
            alt=""
            width={304}
            height={304}
            unoptimized
          />
          <div className="poster-caption">Quórum: quien se apunte</div>
        </div>
      </section>

      <footer>Que conste en acta: nos vemos pronto.</footer>
    </main>
  )
}
