"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation({ image }: { image?: string | null }) {
  const pathname = usePathname()

  return (
    <nav className="club-nav" aria-label="Navegación principal">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m3 10 9-7 9 7v10H3zM9 20v-6h6v6" />
        </svg>
        Inicio
      </Link>
      <Link
        href="/settings"
        aria-current={pathname === "/settings" ? "page" : undefined}
      >
        {image ? (
          // biome-ignore lint/performance/noImgElement: The avatar is a small, external Google profile image.
          <img
            src={image}
            width={24}
            height={24}
            alt=""
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2z" />
          </svg>
        )}
        Ajustes
      </Link>
    </nav>
  )
}
