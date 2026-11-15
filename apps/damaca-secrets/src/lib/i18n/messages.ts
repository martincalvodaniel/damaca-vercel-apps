import { en, type MessageKey } from "./en"
import { es } from "./es"
import type { Locale } from "./locale"

export type { MessageKey }

export const messages = { en, es }

export function formatMessage(
  message: string,
  values: Record<string, string | number>
) {
  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    return Object.hasOwn(values, key) ? String(values[key]) : placeholder
  })
}

export function formatOfflineDates(
  locale: Locale,
  expires: number,
  readOnly = false
) {
  const message = readOnly
    ? messages[locale].offlineReadOnlyDates
    : messages[locale].offlineDates
  return formatMessage(message, {
    expires: new Date(expires).toLocaleString(locale),
  })
}
