"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AccountAvatar } from "@/components/shared/account-avatar"
import { HomeIcon } from "@/components/ui/home-icon"
import { navigationDestinations } from "@/config/navigation"

interface AppNavigationProps {
  name: string
  email: string
  image?: string | null
}

export function AppNavigation({ name, email, image }: AppNavigationProps) {
  const pathname = usePathname()
  const inLibrary =
    pathname === "/" ||
    pathname === "/topics" ||
    pathname.startsWith("/articles/")
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur-lg px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:sticky md:top-0 md:border-t-0 md:border-b md:px-5 md:py-3 dark:border-zinc-800 dark:bg-slate-950/95"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="hidden items-center gap-2 rounded text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 md:flex"
        >
          <Image src="/icon.svg" width={32} height={32} alt="" unoptimized />
          Damaca Digest
        </Link>
        <ul className="flex min-w-0 flex-1 items-stretch gap-1 md:flex-none">
          {navigationDestinations.map((destination) => {
            const active =
              destination.id === "home"
                ? inLibrary
                : pathname.startsWith("/settings")
            return (
              <li key={destination.id} className="min-w-0 flex-1 md:flex-none">
                <Link
                  href={destination.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-4 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:flex-row md:gap-2 md:text-sm ${active ? "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-200" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-slate-800"}`}
                >
                  {destination.id === "settings" ? (
                    <AccountAvatar name={name} email={email} image={image} />
                  ) : (
                    <HomeIcon />
                  )}
                  <span>{destination.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
