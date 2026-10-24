import type { ReactNode } from "react"
import { AppNavigation } from "@/components/shared/app-navigation"

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
  return (
    <>
      <AppNavigation name={name} email={email} image={image} />
      <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </>
  )
}
