"use client"
import { useId } from "react"
import { useTheme } from "@/lib/theme/context"

export function ThemeSettings() {
  const id = useId()
  const { theme, loading, failed, save } = useTheme()
  return (
    <section className="mb-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          Theme
        </label>
        <select
          id={id}
          value={theme}
          disabled={loading}
          onChange={(event) => {
            void save(event.target.value)
          }}
          className="min-h-11 rounded-lg border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      {failed ? (
        <p
          role="status"
          className="mt-2 text-xs text-zinc-600 dark:text-zinc-400"
        >
          Local preferences could not be loaded or saved. Close other app tabs,
          check browser storage permissions, and select a theme to retry.
        </p>
      ) : null}
    </section>
  )
}
