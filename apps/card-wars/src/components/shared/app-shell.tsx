import type { ReactNode } from "react"
import { AppNavigation } from "@/components/shared/app-navigation"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppNavigation />
      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </>
  )
}
