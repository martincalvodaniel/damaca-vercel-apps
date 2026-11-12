import type { Metadata } from "next"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js reads route metadata from the layout.
export const metadata: Metadata = {
  title: "Damaca Secrets",
  description: "A private vault for your account credentials.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
