export const THEME_IDS = ["original", "olive"] as const

export type ThemeId = (typeof THEME_IDS)[number]

export interface UserPreferences {
  theme: ThemeId
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = { theme: "original" }
