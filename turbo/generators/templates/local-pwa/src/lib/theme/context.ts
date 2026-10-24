"use client"

import { createContext, useContext } from "react"

interface ThemeState {
  theme: "system" | "light" | "dark"
  loading: boolean
  failed: boolean
  save(value: string): Promise<void>
}

export const ThemeContext = createContext<ThemeState | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("Theme controls require ThemeProvider.")
  return context
}
