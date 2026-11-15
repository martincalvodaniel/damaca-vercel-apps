import type { Metadata } from "next"
import { LocaleProvider } from "@/components/shared/locale-provider"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import { installName } from "@/config/install-name"
import { messages } from "@/lib/i18n/messages"
import { getLocale } from "@/lib/i18n/server"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js reads route metadata from the layout.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    applicationName: installName,
    appleWebApp: { capable: true, title: installName },
    title: "Damaca Secrets",
    description: messages[locale].description,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-screen antialiased">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
