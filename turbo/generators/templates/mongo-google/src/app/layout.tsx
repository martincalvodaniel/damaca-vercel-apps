import type { Metadata } from "next"
import { ThemeBootstrap } from "@/components/shared/theme-bootstrap"
import "./globals.css"

export const metadata: Metadata = {
  title: "__APP_NAME_JSON__",
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
