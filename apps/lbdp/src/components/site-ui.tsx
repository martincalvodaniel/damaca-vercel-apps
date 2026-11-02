import Image from "next/image"
import Link from "next/link"
import { contact, currentWebsite, type Experience } from "@/content/site"

export function Photo({
  name,
  alt,
  className,
  priority = false,
}: {
  name: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      className={className}
      src={`/images/${name}.webp`}
      alt={alt}
      width={1400}
      height={1100}
      sizes="(max-width: 700px) 100vw, (max-width: 1100px) 60vw, 800px"
      priority={priority}
    />
  )
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="experience-card">
      <Link
        href={`/producto/${experience.slug}/`}
        className="card-image"
        aria-label={`Descubrir: ${experience.title}`}
      >
        <Photo name={experience.image} alt={experience.title} />
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <p className="eyebrow">{experience.category}</p>
      <h3>
        <Link href={`/producto/${experience.slug}/`}>{experience.title}</Link>
      </h3>
      <p>{experience.description}</p>
    </article>
  )
}

export function CurrentWebsiteLink({
  path,
  children,
}: {
  path: string
  children: React.ReactNode
}) {
  return (
    <a className="button" href={`${currentWebsite}${path}`}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  )
}

export function ContactBand() {
  return (
    <section className="contact-band">
      <div>
        <p className="eyebrow">Nos vemos en el Actur · Zaragoza</p>
        <h2>
          Las buenas ideas empiezan
          <br />
          con una conversación.
        </h2>
      </div>
      <Link className="button button-light" href="/contacto/">
        Hablemos <span aria-hidden="true">↗</span>
      </Link>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Link className="footer-brand" href="/">
            La Bottega <i>di Pali</i>
          </Link>
          <p>
            Cerámica, naturaleza y tiempo para crear.
            <br />
            Un pequeño taller en Zaragoza.
          </p>
        </div>
        <div>
          <h2>Descubre</h2>
          <Link href="/talleres-de-ceramica/">Talleres de cerámica</Link>
          <Link href="/talleres-de-cosmetica-natural/">Cosmética natural</Link>
          <Link href="/clases-de-ceramica-regulares/">Clases regulares</Link>
          <Link href="/celebraciones/">Celebraciones</Link>
        </div>
        <div>
          <h2>El taller</h2>
          <Link href="/encargos-personalizados/">Encargos personalizados</Link>
          <Link href="/alquiler-de-horno-ceramico/">Cocciones</Link>
          <Link href="/restauracion-de-piezas-de-ceramica/">Restauración</Link>
          <Link href="/contacto/">Contacto</Link>
        </div>
        <div>
          <h2>Estamos cerca</h2>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.phoneHref}>{contact.phone}</a>
          <a href={contact.instagram}>Instagram ↗</a>
          <a href={contact.whatsapp}>WhatsApp ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} La Bottega di Pali</span>
        <div>
          <a href={`${currentWebsite}/aviso-legal/`}>
            Aviso legal · web actual
          </a>
          <a href={`${currentWebsite}/politica-de-privacidad/`}>
            Privacidad · web actual
          </a>
          <a href={`${currentWebsite}/terminos-y-condiciones/`}>
            Condiciones · web actual
          </a>
          <a href={`${currentWebsite}/subvenciones-y-financiacion/`}>
            Financiación · web actual
          </a>
        </div>
      </div>
    </footer>
  )
}
