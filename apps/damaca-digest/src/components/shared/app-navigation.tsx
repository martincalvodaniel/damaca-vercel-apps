"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AccountAvatar } from "@/components/shared/account-avatar"
import { DigestIcon } from "@/components/ui/digest-icon"
import { HomeIcon } from "@/components/ui/home-icon"
import { navigationDestinations } from "@/config/navigation"

interface AppNavigationProps {
  name: string
  email: string
  image?: string | null
}

export function AppNavigation({ name, email, image }: AppNavigationProps) {
  const pathname = usePathname()
  const inLibrary = pathname === "/" || pathname.startsWith("/articles/")
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 backdrop-blur-lg px-2 pt-0.5 pb-[calc(0.125rem+env(safe-area-inset-bottom))] md:sticky md:top-0 md:border-t-0 md:border-b md:px-5 md:h-(--digest-desktop-nav) md:py-0 dark:border-zinc-800 dark:bg-slate-950/95"
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-4">
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
                : pathname === destination.href ||
                  pathname.startsWith(`${destination.href}/`)
            const current = pathname === destination.href ? "page" : "location"
            return (
              <li key={destination.id} className="min-w-0 flex-1 md:flex-none">
                <Link
                  href={destination.href}
                  aria-current={active ? current : undefined}
                  className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-2 text-[11px] [&_svg]:size-4 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 md:flex-row md:gap-2 md:text-sm ${active ? "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-200" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-slate-800"}`}
                >
                  {destination.id === "settings" ? (
                    <span className="grid size-4 shrink-0 place-items-center [&>*]:size-full [&>*]:text-[9px]">
                      <AccountAvatar name={name} email={email} image={image} />
                    </span>
                  ) : destination.id === "topics" ? (
                    <DigestIcon name="topics" />
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
