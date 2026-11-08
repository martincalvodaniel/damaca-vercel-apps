import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { installName } from "@/config/runtime"
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
