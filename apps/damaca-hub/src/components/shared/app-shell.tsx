import type { ReactNode } from "react"
import { AppNavigation } from "@/components/shared/app-navigation"
import { isAdminEmail } from "@/lib/auth/access"

export function AppShell({
  children,
  name,
  email,
  image,
}: {
  children: ReactNode
  name: string
  email: string
  image?: string | null
}) {
  const isAdmin = isAdminEmail(email)

  return (
    <>
      <AppNavigation
        name={name}
        email={email}
        image={image}
        isAdmin={isAdmin}
      />
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </>
  )
}
