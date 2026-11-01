"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandMark } from "@/components/shared/brand-mark"
import { primaryNavigationItems } from "@/components/shared/primary-navigation-items"

export function DesktopTopNavigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/95 shadow-dialog backdrop-blur-lg sm:block">
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
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ring ${
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-raised hover:text-ink"
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
