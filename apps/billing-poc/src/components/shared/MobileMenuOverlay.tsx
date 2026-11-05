"use client"
import Link from "next/link"
import { useRef } from "react"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import UserSettingsLink from "./UserSettingsLink"
export interface NavItem {
  href: string
  label: string
  matches: (pathname: string) => boolean
}
interface SessionLike {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}
interface MobileMenuOverlayProps {
  items: readonly NavItem[]
  pathname: string
  session: SessionLike | null | undefined
  buildLinkClass: (isActive: boolean) => string
  onClose: () => void
  onSignOut: () => void
}
export default function MobileMenuOverlay({
  items,
  pathname,
  session,
  buildLinkClass,
  onClose,
  onSignOut,
}: MobileMenuOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, true)
  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar menú de navegación"
        className="absolute inset-0 bg-black/50"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute bottom-0 right-0 top-0 w-64 bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Billing
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú de navegación"
            className="min-h-11 min-w-11 rounded-md p-2 text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          {items.map((item) => {
            const isActive = item.matches(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={buildLinkClass(isActive)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        {session?.user ? (
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <div className="mb-3">
              <UserSettingsLink
                user={session.user}
                onNavigate={onClose}
                active={pathname === "/settings"}
              />
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-950"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
