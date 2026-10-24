"use client"

import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  loadThemePreference,
  saveThemePreference,
  subscribeTheme,
} from "@/lib/theme/client"
import { ThemeContext } from "@/lib/theme/context"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    void loadThemePreference()
      .catch(() => {
        if (active) setFailed(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  async function save(value: string) {
    setLoading(true)
    setFailed(false)
    try {
      await saveThemePreference(value)
    } catch {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }
  return (
    <ThemeContext value={{ theme, loading, failed, save }}>
      {children}
    </ThemeContext>
  )
}
