"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { primaryNavigationItems } from "@/components/shared/primary-navigation-items"

export function MobileBottomNavigation() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 w-full max-w-[100vw] overflow-x-clip border-t border-[#d3dbd3] bg-[#fbfaf6]/95 shadow-[0_-10px_30px_rgba(30,57,47,0.08)] backdrop-blur-lg sm:hidden dark:border-white/10 dark:bg-[#142820]/95"
    >
      <div className="mx-auto grid w-full min-w-0 max-w-lg grid-cols-4 gap-1 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {primaryNavigationItems.map((item) => {
          const isActive = item.paths.some((path) => pathname === path)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.625rem] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1d4f40] ${
                isActive
                  ? "bg-[#e3ece1] text-[#1d4f40] dark:bg-[#294b3f] dark:text-[#e7f4eb]"
                  : "text-[#718078] hover:bg-[#edf1eb] hover:text-[#294b3d] dark:text-[#aab8b0] dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="size-5"
              >
                <path
                  d={item.iconPath}
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
