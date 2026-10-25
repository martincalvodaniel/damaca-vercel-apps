"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AccountAvatar } from "@/components/shared/account-avatar"
import { HomeIcon } from "@/components/ui/home-icon"
import { navigationDestinations } from "@/config/navigation"

interface AppNavigationProps {
  name: string
  email: string
  image?: string | null
  isAdmin: boolean
}

export function AppNavigation({
  name,
  email,
  image,
  isAdmin,
}: AppNavigationProps) {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:sticky md:top-0 md:border-t-0 md:border-b md:px-5 md:py-3 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="hidden rounded text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 md:block"
        >
          {"Damaca Hub"}
        </Link>
        <ul className="flex min-w-0 flex-1 items-stretch gap-1 md:flex-none">
          {navigationDestinations
            .filter((destination) => !("adminOnly" in destination) || isAdmin)
            .map((destination) => (
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
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 md:flex-row md:gap-2 md:text-sm ${pathname === destination.href || (destination.href !== "/" && pathname.startsWith(`${destination.href}/`)) ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                >
                  {destination.id === "settings" ? (
                    <AccountAvatar name={name} email={email} image={image} />
                  ) : destination.id === "home" ? (
                    <HomeIcon />
                  ) : null}
                  <span>{destination.label}</span>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </nav>
  )
}
