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
        href="/eventos/26-12-30-nochevieja-letux"
        aria-current={
          pathname.startsWith("/eventos/26-12-30-nochevieja-letux")
            ? "page"
            : undefined
        }
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 7h16v14H4zM8 3v8m8-8v8M4 11h16M8 15h2m4 0h2" />
        </svg>
        Nochevieja 26
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
