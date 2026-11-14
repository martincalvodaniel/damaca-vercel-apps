import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import { installName } from "@/config/install-name"
import { ActionPopup } from "@/features/feedback/feedback"
import { Navigation } from "@/features/landing/navigation"
import { toggleMemberView } from "@/features/settings/actions"
import { getAuthorizedUser } from "@/lib/session"
import "./globals.css"

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const metadata: Metadata = {
  title: "Ebrias Patanes del Jurado",
  description: "Nuestro punto de encuentro",
  applicationName: installName,
  appleWebApp: { capable: true, title: installName },
  icons: {
    icon: { url: "/icons/favicon.svg", type: "image/svg+xml" },
    apple: "/icons/apple-touch-icon.png",
  },
}

// biome-ignore lint/style/useComponentExportOnlyModules: Next.js requires this layout export.
export const viewport: Viewport = { themeColor: "#73caff" }

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getAuthorizedUser()
  return (
    <html lang="es">
      <body>
        {user ? (
          <Navigation
            image={user.image}
            showAdmissionAlerts={user.role === "admin"}
          >
            {user.isAccountAdmin ? (
              <form action={toggleMemberView} className="member-view-form">
                <button
                  type="submit"
                  className="member-view-toggle"
                  aria-label="Vista de miembro"
                  aria-pressed={user.memberView}
                  title={
                    user.memberView
                      ? "Volver a la vista de administrador"
                      : "Ver como miembro"
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </form>
            ) : null}
          </Navigation>
        ) : null}
        {children}
        <ActionPopup />
      </body>
    </html>
  )
}
