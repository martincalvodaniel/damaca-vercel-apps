"use client"

import { type ReactNode, useEffect, useSyncExternalStore } from "react"
import {
  getBrowserLocale,
  LocaleContext,
  subscribeLocale,
} from "@/lib/i18n/client"
import type { Locale } from "@/lib/i18n/locale"

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: ReactNode
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getBrowserLocale,
    () => initialLocale
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}
