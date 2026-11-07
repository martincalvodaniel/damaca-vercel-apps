import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js reads metadata from the root layout.
export const metadata: Metadata = {
  title: "damaca-pocs",
  description: "A workspace for proofs of concept.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
