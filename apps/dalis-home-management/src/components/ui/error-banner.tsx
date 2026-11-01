import type { ReactNode } from "react"

interface ErrorBannerProps {
  children: ReactNode
}

export function ErrorBanner({ children }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="rounded-lg border border-border bg-danger-soft p-3 text-sm text-danger"
    >
      {children}
    </div>
  )
}
