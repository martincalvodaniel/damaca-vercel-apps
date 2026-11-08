import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { installName } from "@/config/install-name"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires metadata exports in the layout module
export const metadata: Metadata = {
  title: "Dali — Nuestro hogar, más fácil",
  appleWebApp: { capable: true, title: installName },
  description:
    "Utilidades creadas por Dani y Pali para organizar y gestionar su hogar.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
