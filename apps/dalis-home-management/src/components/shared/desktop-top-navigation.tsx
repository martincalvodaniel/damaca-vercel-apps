"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandMark } from "@/components/shared/brand-mark"
import { primaryNavigationItems } from "@/components/shared/primary-navigation-items"

export function DesktopTopNavigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[#d3dbd3] bg-[#fbfaf6]/95 shadow-[0_8px_24px_rgba(30,57,47,0.06)] backdrop-blur-lg sm:block dark:border-white/10 dark:bg-[#142820]/95">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between gap-6 px-8">
        <BrandMark />
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1"
        >
          {primaryNavigationItems.map((item) => {
            const isActive = item.paths.some((path) => pathname === path)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${
                  isActive
                    ? "bg-[#e3ece1] text-[#1d4f40] dark:bg-[#294b3f] dark:text-[#e7f4eb]"
                    : "text-[#617168] hover:bg-[#edf1eb] hover:text-[#294b3d] dark:text-[#aab8b0] dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="size-4"
                >
                  <path
                    d={item.iconPath}
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
