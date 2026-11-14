import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
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
  applicationName: installName,
  title: "Dalis Tasks & Events",
  description: "Tus tareas y fechas importantes, también sin conexión",
  appleWebApp: { capable: true, title: installName },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
