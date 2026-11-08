import Image from "next/image"
import Link from "next/link"
import { AccountControl } from "@/features/landing/account-control"
import { getAuthorizedUser } from "@/lib/session"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const [{ error }, user] = await Promise.all([
    searchParams,
    getAuthorizedUser(),
  ])

  return (
    <main className="landing">
      <section className="hero">
        <div className="intro">
          <p className="eyebrow">Club social</p>
          <h1>
            Ebrias <em>Patanes</em> del Jurado
          </h1>
          <p className="lede">Nuestro punto de encuentro</p>
          {user ? (
            <Link className="event-link" href="/eventos/nochevieja-2026">
              Nochevieja en Letux <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <AccountControl
              callbackFailed={Boolean(error)}
              admissionRequired={error === "admission_required"}
            />
          )}
        </div>

        <div className="poster">
          <Image
            src="/images/jury-portrait.jpg"
            alt="Dibujo coloreado del jurado reunido en el estrado"
            loading="eager"
            width={1280}
            height={911}
            sizes="(min-width: 76rem) 30rem, (min-width: 48rem) 42vw, 100vw"
          />
        </div>
      </section>
    </main>
  )
}
