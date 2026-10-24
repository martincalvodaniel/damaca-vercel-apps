"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon } from "@/components/ui/home-icon"
import { SettingsIcon } from "@/components/ui/settings-icon"
import { appConfig } from "@/config/app"
import { navigationDestinations } from "@/config/navigation"

export function AppNavigation() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[#9fb493] bg-[#fff8e7] px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:sticky md:top-0 md:border-t-0 md:border-b md:px-5 md:py-2"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="hidden rounded text-lg font-black tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 md:block"
        >
          {appConfig.name}
        </Link>
        <ul className="flex min-w-0 flex-1 items-stretch gap-1 md:flex-none">
          {navigationDestinations.map((destination) => (
            <li key={destination.id} className="min-w-0 flex-1 md:flex-none">
              <Link
                href={destination.href}
                aria-current={
                  pathname === destination.href ||
                  (destination.href !== "/" &&
                    pathname.startsWith(`${destination.href}/`))
                    ? "page"
                    : undefined
                }
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 md:flex-row md:gap-2 md:text-sm ${pathname === destination.href ? "bg-[#dceec3] text-[#213f36]" : "text-[#4e6450] hover:bg-[#edf2df]"}`}
              >
                {destination.id === "settings" ? (
                  <SettingsIcon />
                ) : destination.id === "history" ? (
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center text-2xl"
                  >
                    📜
                  </span>
                ) : (
                  <HomeIcon />
                )}
                <span>{destination.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
