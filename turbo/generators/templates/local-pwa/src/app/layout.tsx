import type { Metadata, Viewport } from "next"
import { PwaProvider } from "@/components/shared/pwa-provider"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { appConfig } from "@/config/app"
import { installName } from "@/config/install-name"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  applicationName: installName,
  appleWebApp: {
    capable: true,
    title: installName,
    statusBarStyle: "default",
  },
  icons: { apple: "/icons/apple-touch-icon.png" },
}

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
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
    <html lang="en" suppressHydrationWarning>
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
