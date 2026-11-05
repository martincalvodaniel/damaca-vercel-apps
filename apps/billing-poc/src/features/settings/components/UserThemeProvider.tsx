"use client"

import { createContext, type ReactNode, useContext } from "react"
import type {
  ThemeId,
  UserPreferences,
} from "@/lib/domain/entities/user-preferences"
import { useUserPreferences } from "../hooks/useUserPreferences"

const UserThemeContext = createContext<{
  userKey: string
  theme: ThemeId
} | null>(null)

export function UserThemeProvider({
  userKey,
  initialPreferences,
  children,
}: {
  userKey: string
  initialPreferences: UserPreferences
  children?: ReactNode
}) {
  const { data } = useUserPreferences(userKey, initialPreferences)
  const theme = data?.theme ?? initialPreferences.theme

  return (
    <UserThemeContext value={{ userKey, theme }}>
      <div
        data-palette={theme}
        className="min-h-screen bg-background text-foreground [accent-color:var(--palette-primary-600)]"
      >
        {children}
      </div>
    </UserThemeContext>
  )
}

// biome-ignore lint/style/useComponentExportOnlyModules: Context accessor belongs with its provider
export function useUserTheme() {
  const context = useContext(UserThemeContext)
  if (!context) throw new Error("UserThemeProvider is required")
  return context
}
