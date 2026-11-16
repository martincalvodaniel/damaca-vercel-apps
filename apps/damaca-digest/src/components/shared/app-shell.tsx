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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-teal-800 focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to main content
      </a>
      <AppNavigation name={name} email={email} image={image} />
      {/* biome-ignore lint/correctness/useUniqueElementIds: The dashboard layout renders one main landmark and its skip link. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="px-3 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-5 md:pb-0"
      >
        {children}
      </main>
    </>
  )
}
