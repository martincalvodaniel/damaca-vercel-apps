import type { Metadata } from "next"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires metadata to be exported alongside the root layout.
export const metadata: Metadata = {
  title: "Damaca Hub",
  description:
    "An application directory and access manager for Damaca web apps.",
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
