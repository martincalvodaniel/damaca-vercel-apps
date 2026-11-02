// biome-ignore-all lint/style/useComponentExportOnlyModules: Next.js route modules require metadata and static-generation exports.
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ContactBand, CurrentWebsiteLink, Photo } from "@/components/site-ui"
import { experiences } from "@/content/site"

export const dynamicParams = false
export function generateStaticParams() {
  return experiences.map((experience) => ({ slug: experience.slug }))
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const experience = experiences.find((item) => item.slug === slug)
  return { title: experience?.title, description: experience?.description }
}
export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const experience = experiences.find((item) => item.slug === slug)
  if (!experience) notFound()
  return (
    <>
      <div className="section-wrap breadcrumb">
        <Link
          href={
            experience.category === "Cerámica"
              ? "/talleres-de-ceramica/"
              : "/talleres-de-cosmetica-natural/"
          }
        >
          ← Volver a talleres
        </Link>
      </div>
      <section className="section-wrap product-hero">
        <Photo name={experience.image} alt={experience.title} priority />
        <div>
          <p className="eyebrow">
            Taller de {experience.category.toLowerCase()} · Zaragoza
          </p>
          <h1>{experience.title}</h1>
          <p className="page-lead">{experience.description}</p>
          <p>{experience.detail}</p>
          <div className="included">
            <h2>Para que solo pienses en crear</h2>
            <p>{experience.includes}</p>
          </div>
          <CurrentWebsiteLink path={`/producto/${experience.slug}/`}>
            Consultar fechas y precios en la web actual
          </CurrentWebsiteLink>
          <p className="small-note">
            La disponibilidad y la compra se gestionan en nuestra web actual.
          </p>
        </div>
      </section>
      <ContactBand />
    </>
  )
}
