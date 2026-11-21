import type { ReactNode } from "react"
import { AppNavigation } from "@/components/shared/app-navigation"
import { TabSwipeContent } from "@/components/shared/tab-swipe-content"
import type { FilterPath } from "@/features/filters/remembered-query"

export function AppShell({
  children,
  filterDestinations,
  name,
  email,
  image,
}: {
  children: ReactNode
  filterDestinations?: Partial<Record<FilterPath, string>>
  name?: string
  email?: string
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
      <AppNavigation
        filterDestinations={filterDestinations}
        name={name}
        email={email}
        image={image}
      />
      <TabSwipeContent filterDestinations={filterDestinations}>
        {children}
      </TabSwipeContent>
    </>
  )
}
