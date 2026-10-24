"use client"

import { openLocalDatabase } from "@/lib/storage/database"
import { themePreferenceSchema } from "@/schemas/theme"

export async function readThemePreference() {
  const database = await openLocalDatabase()
  const value = await database.get("preferences", "theme")
  return value === undefined ? undefined : themePreferenceSchema.parse(value)
}

export async function writeThemePreference(value: unknown) {
  const theme = themePreferenceSchema.parse(value)
  const database = await openLocalDatabase()
  await database.put("preferences", theme, "theme")
}
