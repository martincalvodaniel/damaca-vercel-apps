"use client"

import { createContext, useContext } from "react"
import {
  defaultLocale,
  type Locale,
  localeCookie,
  readLocaleCookie,
} from "./locale"
import { messages } from "./messages"

export const LocaleContext = createContext<Locale>(defaultLocale)
const localeChange = "damaca-secrets-locale-change"

export function subscribeLocale(callback: () => void) {
  window.addEventListener(localeChange, callback)
  window.addEventListener("focus", callback)
  window.addEventListener("pageshow", callback)
  return () => {
    window.removeEventListener(localeChange, callback)
    window.removeEventListener("focus", callback)
    window.removeEventListener("pageshow", callback)
  }
}

export function getBrowserLocale() {
  try {
    return readLocaleCookie(document.cookie)
  } catch {
    return defaultLocale
  }
}

export function saveLocale(locale: Locale) {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  try {
    // biome-ignore lint/suspicious/noDocumentCookie: Support browsers without Cookie Store and persist only a validated locale.
    document.cookie = `${localeCookie}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
    if (getBrowserLocale() !== locale) return false
  } catch {
    return false
  }
  window.dispatchEvent(new Event(localeChange))
  return true
}

export function useLocale() {
  const locale = useContext(LocaleContext)
  return { locale, t: messages[locale] }
}
