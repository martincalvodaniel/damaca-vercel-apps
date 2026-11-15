"use client"
import {
  type ChangeEvent,
  useCallback,
  useId,
  useState,
  useSyncExternalStore,
} from "react"
import { useLocale } from "@/lib/i18n/client"
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  saveThemePreference,
  subscribeTheme,
} from "@/lib/theme/client"

export function ThemeSettings() {
  const { t } = useLocale()
  const id = useId()
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )
  const [notSaved, setNotSaved] = useState(false)
  const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setNotSaved(!saveThemePreference(event.target.value))
  }, [])
  return (
    <section className="mb-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-medium">
          {t.theme}
        </label>
        <select
          id={id}
          value={theme}
          onChange={handleChange}
          className="min-h-9 rounded-lg border border-zinc-300 bg-transparent px-3 dark:border-zinc-700"
        >
          <option value="system">{t.systemTheme}</option>
          <option value="light">{t.lightTheme}</option>
          <option value="dark">{t.darkTheme}</option>
        </select>
      </div>
      {notSaved ? (
        <p
          role="status"
          className="mt-2 text-xs text-zinc-600 dark:text-zinc-400"
        >
          {t.themeNotSaved}
        </p>
      ) : null}
    </section>
  )
}
