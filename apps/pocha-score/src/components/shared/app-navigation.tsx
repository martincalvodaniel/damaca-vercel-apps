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
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white px-1.5 pt-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:sticky md:top-0 md:border-t-0 md:border-b md:px-1.5 md:py-1 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-1.5">
        <Link
          href="/"
          className="hidden rounded text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 md:block"
        >
          {appConfig.name}
        </Link>
        <ul className="flex min-w-0 flex-1 items-stretch gap-0.5 md:flex-none">
          {navigationDestinations.map((destination) => (
            <li key={destination.id} className="min-w-0 flex-1 md:flex-none">
              <Link
                href={destination.href}
                onClick={
                  destination.id === "home"
                    ? () => window.dispatchEvent(new Event("pocha:home"))
                    : undefined
                }
                aria-current={
                  pathname === destination.href ||
                  (destination.href !== "/" &&
                    pathname.startsWith(`${destination.href}/`))
                    ? "page"
                    : undefined
                }
                className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:flex-row md:gap-1.5 md:text-sm ${pathname === destination.href || (destination.href !== "/" && pathname.startsWith(`${destination.href}/`)) ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
              >
                {destination.id === "settings" ? (
                  <SettingsIcon />
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
