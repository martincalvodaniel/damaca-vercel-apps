"use client"
import { THEME_CHANGE_EVENT, THEME_STORAGE_KEY } from "@/config/theme"
import {
  readThemePreference,
  writeThemePreference,
} from "@/lib/storage/preferences"
import { parseThemePreference, themePreferenceSchema } from "@/schemas/theme"

export function getThemeSnapshot() {
  return parseThemePreference(
    document.documentElement.getAttribute("data-theme")
  )
}
export function getServerThemeSnapshot() {
  return "system" as const
}
export function subscribeTheme(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
    document.documentElement.setAttribute(
      "data-theme",
      parseThemePreference(event.newValue)
    )
    listener()
  }
  window.addEventListener(THEME_CHANGE_EVENT, listener)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, listener)
    window.removeEventListener("storage", onStorage)
  }
}
export async function loadThemePreference() {
  const theme = (await readThemePreference()) ?? getThemeSnapshot()
  applyThemePreference(theme)
}

function applyThemePreference(value: unknown) {
  const theme = themePreferenceSchema.parse(value)
  document.documentElement.setAttribute("data-theme", theme)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // IndexedDB remains authoritative if the synchronous startup cache is blocked.
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export async function saveThemePreference(value: unknown) {
  await writeThemePreference(value)
  applyThemePreference(value)
}
