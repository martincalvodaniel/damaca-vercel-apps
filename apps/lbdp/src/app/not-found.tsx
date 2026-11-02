import Link from "next/link"

export default function NotFound() {
  return (
    <section className="section-wrap not-found">
      <p className="eyebrow">404 · Una pieza por encontrar</p>
      <h1>
        Por aquí todavía
        <br />
        no hay barro.
      </h1>
      <p>
        La página que buscas no está disponible. Vuelve al taller y encuentra
        una experiencia para ti.
      </p>
      <Link className="button" href="/">
        Volver al inicio <span aria-hidden="true">↗</span>
      </Link>
    </section>
  )
}
