// biome-ignore-all lint/style/useComponentExportOnlyModules: Next.js route modules require metadata and static-generation exports.
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ContactBand,
  CurrentWebsiteLink,
  ExperienceCard,
  Photo,
} from "@/components/site-ui"
import {
  contact,
  currentWebsite,
  editorialPages,
  experiences,
} from "@/content/site"

const specialSlugs = [
  "talleres-de-ceramica",
  "talleres-de-cosmetica-natural",
  "contacto",
]
export const dynamicParams = false
export function generateStaticParams() {
  return [...specialSlugs, ...editorialPages.map((page) => page.slug)].map(
    (slug) => ({ slug })
  )
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = editorialPages.find((item) => item.slug === slug)
  const title =
    page?.title ??
    (slug === "contacto"
      ? "Contacto"
      : slug === "talleres-de-ceramica"
        ? "Talleres de cerámica"
        : "Talleres de cosmética natural")
  return { title, description: page?.description }
}

export default async function EditorialRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (slug === "contacto")
    return (
      <section className="section-wrap contact-page">
        <p className="eyebrow">Nos encantará escucharte</p>
        <h1>¿Tomamos contacto?</h1>
        <p className="page-lead">
          Una duda, una idea o un taller que te apetece probar. Estamos al otro
          lado.
        </p>
        <div className="contact-grid">
          <a href={`mailto:${contact.email}`}>
            <span>Escríbenos</span>
            <strong>{contact.email}</strong>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={contact.phoneHref}>
            <span>Llámanos</span>
            <strong>{contact.phone}</strong>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={contact.whatsapp}>
            <span>Lo hablamos por</span>
            <strong>WhatsApp</strong>
            <span aria-hidden="true">↗</span>
          </a>
          <a href={contact.instagram}>
            <span>El día a día del taller</span>
            <strong>Instagram</strong>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="visit-note">
          <h2>Ven a vernos al Actur</h2>
          <p>
            Estamos en Zaragoza. Consulta la ubicación, los horarios y sus
            posibles cambios en nuestra web actual antes de venir.
          </p>
          <CurrentWebsiteLink path="/contacto/">
            Consultar ubicación y horarios
          </CurrentWebsiteLink>
        </div>
      </section>
    )
  if (
    slug === "talleres-de-ceramica" ||
    slug === "talleres-de-cosmetica-natural"
  ) {
    const isCeramics = slug === "talleres-de-ceramica"
    const category = isCeramics ? "Cerámica" : "Cosmética natural"
    return (
      <>
        <section className="section-wrap listing-page">
          <p className="eyebrow">Aprender haciendo · Zaragoza</p>
          <h1>
            {isCeramics ? (
              <>
                Las manos ocupadas.
                <br />
                <em>La mente en calma.</em>
              </>
            ) : (
              <>
                Naturaleza, texturas
                <br />
                <em>y tiempo para cuidarte.</em>
              </>
            )}
          </h1>
          <p className="page-lead">
            {isCeramics
              ? "Encuentra una experiencia para descubrir el barro a tu manera. No hace falta haberlo probado antes."
              : "Un acercamiento práctico a los ingredientes y procesos de la cosmética artesanal."}
          </p>
          <nav className="category-links" aria-label="Tipos de taller">
            <Link
              aria-current={isCeramics ? "page" : undefined}
              href="/talleres-de-ceramica/"
            >
              Cerámica
            </Link>
            <Link
              aria-current={!isCeramics ? "page" : undefined}
              href="/talleres-de-cosmetica-natural/"
            >
              Cosmética natural
            </Link>
          </nav>
          <div className="experience-grid">
            {experiences
              .filter((experience) => experience.category === category)
              .map((experience) => (
                <ExperienceCard key={experience.slug} experience={experience} />
              ))}
          </div>
          <p className="catalogue-note">
            Las fechas, los precios y las plazas se consultan en la web actual
            al abrir cada taller.
          </p>
        </section>
        <ContactBand />
      </>
    )
  }
  const page = editorialPages.find((item) => item.slug === slug)
  if (!page) notFound()
  return (
    <>
      <section className="section-wrap editorial-hero">
        <div>
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-lead">{page.description}</p>
          <CurrentWebsiteLink path={page.currentPath}>
            {page.action}
          </CurrentWebsiteLink>
        </div>
        <Photo name={page.image} alt={page.description} priority />
      </section>
      <section className="section-wrap editorial-sections">
        {page.sections.map((section) => (
          <article key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        ))}
      </section>
      {slug === "servicios" ? (
        <nav
          className="section-wrap service-links"
          aria-label="Servicios del taller"
        >
          {editorialPages
            .filter((item) =>
              [
                "alquiler-de-horno-ceramico",
                "restauracion-de-piezas-de-ceramica",
                "encargos-personalizados",
              ].includes(item.slug)
            )
            .map((item) => (
              <Link key={item.slug} href={`/${item.slug}/`}>
                {item.title} <span aria-hidden="true">↗</span>
              </Link>
            ))}
        </nav>
      ) : null}
      <div className="section-wrap current-note">
        <p>
          Para conocer las condiciones vigentes y organizar tu visita, consulta
          la{" "}
          <a href={`${currentWebsite}${page.currentPath}`}>
            web actual de La Bottega
          </a>{" "}
          o <Link href="/contacto/">habla con nosotras</Link>.
        </p>
      </div>
      <ContactBand />
    </>
  )
}
