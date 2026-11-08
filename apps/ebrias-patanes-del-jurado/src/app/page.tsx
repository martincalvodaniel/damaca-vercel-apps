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

        <figure className="poster">
          <Image
            src="/images/jury-portrait.jpg"
            alt="Dibujo coloreado del jurado reunido en el estrado"
            width={1280}
            height={911}
            sizes="(min-width: 76rem) 30rem, (min-width: 48rem) 42vw, 100vw"
          />
          <Image
            className="framed-photo"
            src="/images/jury-framed.jpg"
            alt="El dibujo del jurado en su marco azul de nubes"
            width={1280}
            height={960}
            sizes="(min-width: 76rem) 23rem, (min-width: 48rem) 32vw, 75vw"
          />
          <figcaption className="poster-caption">
            Quórum: quien se apunte
          </figcaption>
        </figure>
      </section>

      <footer>Que conste en acta: nos vemos pronto.</footer>
    </main>
  )
}
