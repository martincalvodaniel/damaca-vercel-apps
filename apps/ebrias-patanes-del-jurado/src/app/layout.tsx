import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { installName } from "@/config/runtime"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const metadata: Metadata = {
  title: "Ebrias Patanes del Jurado",
  description: "El punto de encuentro para la próxima quedada.",
  applicationName: installName,
  appleWebApp: { capable: true, title: installName },
  icons: {
    icon: { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
    apple: "/icons/apple-touch-icon.png",
  },
}

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const viewport: Viewport = { themeColor: "#25152e" }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
