import type { Metadata } from "next"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires metadata exports in route layouts.
export const metadata: Metadata = {
  title: "Alexa POC",
  description: "A private app with Google sign-in and MongoDB-backed access.",
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
