import Link from "next/link"
import { ContactBand, ExperienceCard, Photo } from "@/components/site-ui"
import { experiences } from "@/content/site"

export default function HomePage() {
  return (
    <>
      <section className="home-hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-line" /> Taller de cerámica · Zaragoza
          </p>
          <h1>
            Un poco de barro.
            <br />
            Un momento
            <br />
            <em>para ti.</em>
          </h1>
          <p className="hero-description">
            Baja el ritmo, mancha tus manos y descubre todo lo que puedes crear.
            Bienvenida a La Bottega di Pali.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/talleres-de-ceramica/">
              Encuentra tu taller <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/clases-de-ceramica-regulares/">
              Quiero venir cada semana
            </Link>
          </div>
          <p className="hero-caption">
            No necesitas experiencia. Solo ganas de probar.
          </p>
        </div>
        <div className="hero-visual">
          <Photo
            name="studio"
            alt="Creación artesanal de cerámica en La Bottega di Pali"
            priority
          />
          <div className="photo-label">
            Hecho a mano.
            <br />
            <i>Con calma y con alma.</i>
          </div>
          <span className="image-caption">01 / El placer de crear</span>
        </div>
      </section>
      <section className="intro-strip">
        <p>
          Barro entre las manos.
          <br />
          <em>Espacio para desconectar.</em>
        </p>
        <span>
          En el corazón del Actur, unimos cerámica y cosmética artesanal para
          compartir lo que más nos gusta: aprender, experimentar y crear en
          compañía.
        </span>
      </section>
      <section className="section-wrap experiences-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Elige tu pequeño paréntesis</p>
            <h2>¿Qué te apetece crear?</h2>
          </div>
          <Link className="text-link" href="/talleres-de-ceramica/">
            Explorar talleres <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="experience-grid">
          {experiences.slice(0, 3).map((experience) => (
            <ExperienceCard key={experience.slug} experience={experience} />
          ))}
        </div>
      </section>
      <section className="story-section section-wrap">
        <div className="story-image">
          <Photo
            name="pali"
            alt="Piezas y vida del taller de La Bottega di Pali"
          />
        </div>
        <div className="story-copy">
          <p className="eyebrow">Mucho más que una tienda</p>
          <h2>
            Una bottega.
            <br />
            Muchas historias.
          </h2>
          <p>
            Me llamo Paola, aunque todos me conocen como Pali. Este espacio es
            un homenaje a mis raíces italianas y a mi familia de artesanos.
          </p>
          <p>
            Una <i>bottega</i> es tienda y taller a la vez. Un lugar donde las
            cosas se hacen con las manos, cada pieza es distinta y el proceso
            importa tanto como el resultado.
          </p>
          <Link className="text-link" href="/servicios/">
            Conoce lo que hacemos <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="gift-section section-wrap">
        <p className="eyebrow">Algo bonito que compartir</p>
        <h2>
          Regala una experiencia.
          <br />
          <em>El recuerdo lo crea esa persona.</em>
        </h2>
        <p>
          Un taller, un momento de desconexión y algo hecho con sus propias
          manos.
        </p>
        <Link className="button" href="/bono-regalo/">
          Descubre el bono regalo <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <ContactBand />
    </>
  )
}
