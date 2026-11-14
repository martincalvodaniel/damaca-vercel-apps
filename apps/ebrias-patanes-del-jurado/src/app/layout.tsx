import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { installName } from "@/config/install-name"
import { Navigation } from "@/features/landing/navigation"
import { getAuthorizedUser } from "@/lib/session"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const metadata: Metadata = {
  title: "Ebrias Patanes del Jurado",
  description: "Nuestro punto de encuentro",
  applicationName: installName,
  appleWebApp: { capable: true, title: installName },
  icons: {
    icon: { url: "/icons/favicon.svg", type: "image/svg+xml" },
    apple: "/icons/apple-touch-icon.png",
  },
}

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const viewport: Viewport = { themeColor: "#73caff" }

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getAuthorizedUser()
  return (
    <html lang="es">
      <body>
        {user ? (
          <Navigation
            image={user.image}
            showAdmissionAlerts={user.role === "admin"}
          />
        ) : null}
        {children}
      </body>
    </html>
  )
}
