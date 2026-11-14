// biome-ignore-all lint/style/useComponentExportOnlyModules: Next.js route modules require metadata and static-generation exports.
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-ui"
import { installName } from "@/config/install-name"
import "./globals.css"

export const metadata: Metadata = {
  applicationName: installName,
  appleWebApp: { capable: true, title: installName },
  title: {
    default: "La Bottega di Pali · Cerámica en Zaragoza",
    template: "%s · La Bottega di Pali",
  },
  description:
    "Un espacio para crear con las manos. Talleres de cerámica, clases regulares y cosmética artesanal en el Actur, Zaragoza.",
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#main">
          Saltar al contenido
        </a>
        <div className="preview-note">
          Estamos dando forma a una nueva Bottega. Las fechas y compras siguen
          en nuestra web actual.
        </div>
        <SiteHeader />
        {/* biome-ignore lint/correctness/useUniqueElementIds: This singleton document landmark is the stable skip-link target. */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
