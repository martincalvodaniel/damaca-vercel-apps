import type { Metadata, Viewport } from "next"
import { PwaProvider } from "@/components/shared/pwa-provider"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { appConfig } from "@/config/app"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js layouts require route metadata exports in this file.
export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  applicationName: appConfig.name,
  appleWebApp: {
    capable: true,
    title: appConfig.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" }],
    apple: "/icons/apple-touch-icon.png",
  },
}

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js layouts require viewport metadata exports in this file.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#047857",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-screen antialiased">
        <PwaProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </PwaProvider>
      </body>
    </html>
  )
}
